
# Hosted applications
- vmc-ng was built as a 'shell' that host mini applications (a.k.a vmc-apps) based on context. 
- Developers can easily build vmc-app and register them into the VMC-ng shell and benefit its features and services such as user-context, permission concepts, i18n, caching, lazy loading etc.
- To provide flexible platform each vmc-app is self-sufficient and is not aware/dependent on others.
- VMC-app is however depend on the VMC-ng shell and thus should be hosted in the same sub-domain. 

We are using nginx during the developement process to simulate one sub-domain of multiple repositories.

### Setup nginx on your machine
To install nginx using homebrew read the following [article](http://learnaholic.me/2012/10/10/installing-nginx-in-mac-os-x-mountain-lion/).

Update nginx configuration file (usually at ```/usr/local/etc/nginx/nginx.conf```) with the following server:

```bash
 server {
    listen       1234;
    server_name  localhost;

    # access_log  /var/log/nginx_access.log;

    # This is the default location that exposes the vmc-ng application served at 4200
    location /{
        proxy_pass   http://localhost:4200;
    }
 }
```

### Connect VMC-App to VMC-ng locally
1. Clone the vmc-app you want to develop

Update nginx configuration file:
* add the following inside the server node we created in previous step.
* Append it **above** the default location.

```bash
    location /{the relative url of that application}/ {
        alias {the path to the vmc-app repository code/dist folder};
    }
```

For example, for the player-studio vmc-app the configuration should resemble the following:
```bash
    location /player-studio/ {
        alias /Users/eransakal/dev/github/vidiun/player-studio/player-studio/app/;
    }
```

> You will need to signal nginx to refresh nginx by running ```sudo nginx -s reload```
