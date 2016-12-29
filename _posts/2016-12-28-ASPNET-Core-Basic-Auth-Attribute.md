---
layout: post
section-type: post
title: Basic Auth mit ASP.NET Core MVC
category: C#
tags: [ 'ASP.NET', 'Basic Authentication', '.NET CORE', 'REST', 'Attribute', 'C#', 'Azure', 'MVC']
---

Basic Authentication ist eine der einfachsten und gängigsten Authentifizierungsmehtoden im Internet. Die Art und Weise wie diese 
Authentifizierung funktioniert ist in der [RFC 2617, HTTP Authentication: Basic and Digest Access Authentication](http://www.ietf.org/rfc/rfc2617.txt) spezifiziert. Die aktuelle Version von ASP.NET Core MVC kommt von Hause aus ohne Basic Authenication, da dies inperformant (Bei jedem HTTP-Request muss die Authentifizierung durchlaufen werden) ist und hohe sicherheitsrisiken mit sich bringt (Benutzername und Passwort werden im Klartext versendet). Aufgrund der Sicherheitsrisiken ist es nicht nur dringend empfohlen, sondern unvermeidlich eine verschlüsselte Verbinung via HTTPS zum Server aufzubauen.Wenn wir unsere REST-Api auf [Microsoft Azrue](https://azure.microsoft.com) als App Service hosten, bekommen wir direkt ein gültiges HTTPS-Zertifikat für unsere Anwendung "Out of the Box". Für Lösungen die woanders gehostet werden, bietet [Let's Encrypt](https://letsencrypt.org/) eine kostenlose Alternative um an gültige Zertifikate für HTTPS zu kommen. Es gibt also keine Ausreden mehr ;)!  
Wie dem auch sei, die bessere alternative für eine sichere und performatere Lösung sind [JSON Web Token (JWT)](https://jwt.io/), die in der [RFC 7519](https://tools.ietf.org/html/rfc7519) spezifiziert sind und das Authentifizierungsschema _Bearer_ verwenden.  

Trotzdem aller Nachteile der Basic Authentication gegenüber neuerer Technologien gibt es heute noch viele gute Gründe, Basic Authentication zu verwenden:
* Einfache Authentifizierung für **prototypische Implementierungen**
* Von vielen Webbrowsern unterstützt (Eingabedialog für Benutzername und Kennwort)
* Auf HTTP-Protokoll-Ebene leicht zu implementieren/ debuggen
* Unterstützung von bestehenden, auf Basic Authentifizierung basierenden, (Legacy-)Anwendungen

Aus diesen Gründen möchte ich zeigen, wie einfach man ein eigenes C#-[Attribute](https://msdn.microsoft.com/en-us/library/system.attribute(v=vs.110).aspx) implementieren kann, dass ähnlich wie das [AuthorizeAttribute](https://msdn.microsoft.com/en-us/library/system.web.mvc.authorizeattribute(v=vs.118).aspx) von ASP.NET MVC funktioniert.

### Aufbau eines HTTP Requests
Um die Basis dafür zu schaffen, schauen wir uns zuerst den Aufbau eines beliebigen HTTP-Requests mit Basic Authentifizierung an:

<script src="https://gist.github.com/rherlt/2f43632666823e00d8c0f220e55f521e.js"></script>

In diesem HTTP-Request finden wir den [Authorization HTTP Header](https://de.wikipedia.org/wiki/HTTP-Authentifizierung). Der Wert des Authorization-Schlüssels lautet _"Basic dXNlcm5hbWU6cGFzc3dvcmQ="_. Das Wort _"Basic"_ vermittelt den Server, dass ein Client versucht sich mit der Basic-Authentifizierung am Server zu authenthifizieren. Getrennt von dem Schlüsselwort _"Basic"_ und einem Leerzeichen folgt ein Token, indem Benutzername und Kennwort zu finden sind. Wer an dieser Stelle glaubt, dass es sich hierbei um eine verschlüsselte oder gehashte Zeichenkettte habdelt, die nicht ohne weiteres in Klartext umgewandelt werden kann, liegt an dieser Stelle falsch. Genau gesagt handelt es sich hier bei um eine [Base64](https://de.wikipedia.org/wiki/Base64) kodierte Zeichenkette, die Problemlos wieder in einen Klartext umgewandelt werden kann.

<script src="https://gist.github.com/rherlt/38564e61bf5dce2c35979944c5b6061b.js"></script>

Wie zu erkennen ist, sind Benutzername und Kennwortt getrennt durch einen Doppelpukt aneinander gereiht und in ergeben als Base64 kodierte Zeichenkette den Basic Token für die Authentifizierung.

### Statische Authentifizierung

Die Authentifizierung mit statischen  Zugangsdaten funktioniert ganz einfach, allerdings bietet sie nicht viel Spielraum, denn die Zugangsdaten sind hart in den Quellcode integriert. 

<script src="https://gist.github.com/rherlt/f9a67e5bf6efb2d5bbdecf0ee36af8b3.js"></script>

Um wie im oberen Beispiel zu erreichen, den _Get()_-Methode des _AuthController_s mit der Basic Authentifizierung auszustatten, muss man lediglich das [BasicAuthenticationAttribute](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth/BasicAuthentication/BasicAuthenticationAttribute.cs) verwenden und als Parameter die Zugangsdaten übergeben. Als Ergebnis wird die Methode unserer REST API nun geschützt. Testen können wir das, indem wir einen HTTP Request absenden. Ich verwende dazu häufig Tools wie [Fiddler](http://www.telerik.com/fiddler) oder [Postman](https://www.getpostman.com/), die es ermöglichen auf HTTP-Protokollebene Anfragen auszuführen und die Antworten anzuzeigen. Mein Test sieht wie folgt aus: 

<script src="https://gist.github.com/rherlt/b7059042aa13eb0d9c1219c16c72aeed.js"></script>

Dabei erhalte ich folgende Antwort vom Server: 

<script src="https://gist.github.com/rherlt/8bf2d263c3a289274c96a896c13458f4.js"></script>

Wie man sieht, war ich authorisiert meine Anfrage an die REST API durchzuführen. Der erkannte Benutzername lautet _someone@example.com_.
### UserManager Authentifizierung
Da die statische Authentifizierung oft nicht flexibel genug ist, sondern wir häufig den Anwendungsfall haben, dass wir unserer Benutzer mit dem [IdentityFramework](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity) verwalten, habe ich das Programm dahingehend erweitert. Im folgenden Beispiel sieht man nun, wie die _Get()_-Methode mit dem [UserManagerBasicAuthenticationAttribute](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth/BasicAuthentication/UserManagerBasicAuthenticationAttribute.cs) bestückt ist. Als Parameter bekommt dieses Attribut noch den Typen unseres IdentityUsers übergeben. Dieser Typ besagt, mit welcher konkreten Model-Klasse wir mit dem IdentityFramework arbeiten möchten. Sofern man das generierte Projekt-Template vom Visual Studio verwendet und nichts anpasst, wird standardmäßig die Klasse [ApplicationUser](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth.WebApplication/Models/ApplicationUser.cs) für diesen Zweck generiert. Die Besonderheit dieser Klasse besteht darin, dass sie von [IdentityUser](https://msdn.microsoft.com/en-us/library/dn613256(v=vs.108).aspx) erbt.

<script src="https://gist.github.com/rherlt/e84d2ca93955c20ed1306e884012c103.js"></script>

Bei einem erneuten Test sieht der HTTP Request dann wie folgt aus:

<script src="https://gist.github.com/rherlt/98bf8bf8117dbce8be354514d85a527a.js"></script>

Der Server antwortet wie erwartet, die Authentifizierung gegen das IdentityFramework hat erfolgreich funktioniert.

<script src="https://gist.github.com/rherlt/c0d1945a06a1710e93abaf87a0f97595.js"></script>

### Was passiert unter der Haube?
Sowohl das [BasicAuthenticationAttribute](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth/BasicAuthentication/BasicAuthenticationAttribute.cs) als auch das [UserManagerBasicAuthenticationAttribute](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth/BasicAuthentication/UserManagerBasicAuthenticationAttribute.cs) erben beide von der Basisklasse [BasicAuthenticationBaseAttribute](https://github.com/rherlt/Blog-NetCoreBasicAuth/blob/master/src/com.rherlt.NetCoreBasicAuth/BasicAuthentication/BasicAuthenticationBaseAttribute.cs). Diese Klasse wiederum erbt von [ActionFilterAttribute](https://msdn.microsoft.com/de-de/library/system.web.mvc.actionfilterattribute(v=vs.118).aspx) was dafür sorgt, dass jede für Action die auf einem Contorller ausgeführt wird, zuvor die Methode _OnActionExecuting()_ aufgerufen wird. In dieser Methode führen wir für jeden HTTP Request eine Basic Authentifizierung durch und prüfen, ob die im HTTP Header bereitgstellten Zugangsdaten valide sind. Für den Fall das sie nicht valide sind, wird ein entsprechender HTTP Response generiert. Für die Fall, dass es sich um valide Zugangsdaten handelt, wird der aktuelle Benutzerkontext gesetz und vorerst kein HTTP Repsonse generiert, da anschließend vom MVC Framework die Methode des entsprechenden Controllers aufgerufen wird.

### Fazit
Wie bereits erwähnt, ist es in dem meisten Fällen nicht empfehlenswert Basic Authentication zu verwenden. Wenn man jedoch aus einem der besagten Gründe daruf angewiesen ist, ist es trotzdem möglich ASP.NET Core MVC WebApi zusammen mit Basic Authentication zu verwenden.

Der gesamte Quellcode dieses Blogeintrags inklusive steht auf Github bereit: [https://github.com/rherlt/Blog-NetCoreBasicAuth](https://github.com/rherlt/Blog-NetCoreBasicAuth)