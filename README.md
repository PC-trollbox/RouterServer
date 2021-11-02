# RouterServer
Original file collection for RouterServer. RouterServer - software to host routers in Windows. DNS server included.

# Startup
The startup process is a bit complicated.

1. Configure the server if you haven't yet. Check config.example.json, rename it to config.json.
2. Start the router server (index.js) **WITH ADMINISTRATOR PERMISSIONS**.
3. Start DNS server from dns-proxy-server for better effect.
4. Change IP if you haven't yet. Go to your network adapter settings, select a new one, click Properties, select IPv4 and then "Configure". Select "Use this IP address" and type in 192.168.0.1 (You might not be able to access your router settings anymore!), and if you started the DNS server, change it to 127.0.0.1

# Connecting other users
If you want to enable the DNS server for other user, go to user's network adapter settings, select a new one, click Properties, select IPv4 and then "Configure". Change DNS server to 192.168.0.1.

# Turning off
If you want to access your router's settings, proceed with this instruction:

1. Change IP. Go to your network adapter settings, select a new one, click Properties, select IPv4 and then "Configure". Select "Get IP address automatically".
2. Go to RouterServer's admin from your local IP ([localhost](http://localhost)).
3. Select "Turn off". The adapter will disappear, and the WiFi access point will disappear.
4. If you started DNS server, close it too.

If you don't care about your router's admin, do the same but don't do the option 1.

# RPE edition
If you are a fellow Toppat, RPE edition will be on PCsystem's Toppat File Storage.

Right now it is not in here, but you can DM me on Discord (PC#7105) to get it.
