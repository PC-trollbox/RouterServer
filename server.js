const app = require("express")();
const http = require("http").createServer(app);
const cookieParsing = require("cookie");
const fs = require("fs");
const { spawn } = require('child_process');
var configuration = require(__dirname + "/config.json")
function writeConfig() {
	fs.writeFile(__dirname + "/config.json", JSON.stringify(configuration), function(err) {
		if (err) return console.log(err);
		setTimeout(writeConfig, 1000);
	});
}
writeConfig();

app.use(function(req, res, next) {
	if (req.headers.host != "localhost" && req.headers.host != "myrouteradmin.net" && req.headers.host != "192.168.0.1") return res.status(403).sendFile(__dirname + "/blockPage.html");
	req.cookies = cookieParsing.parse((req.headers.cookie || ""));
	next();
});

app.get("/", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		res.redirect("/management");
	} else {
		fs.readFile(__dirname + "/manageServerLogin.html", function(err, text) {
			if (err) return res.status(500).send("We ducked up. Please retry in a few minutes. If the router is still crashing, go online and ask the Router admin install the latest update.");
			var unDuckedText = text.toString();
			unDuckedText = unDuckedText.replaceAll("%HideIfNoToppatServer%", "<!-- This was hidden because the server is not RPE. Please install the Toppat version.");
			unDuckedText = unDuckedText.replaceAll("%EndHideIfNoToppatServer%", "This was hidden because the server is not RPE. Please install the Toppat version. -->");
			res.send(unDuckedText);
		});
	}
});
app.get("/dns", function(req, res) {
	if (req.query.action == "getrecord") {
		if (req.query.host == undefined) {
			res.status(404).json({ok: false, err: 0001, note: "The undefined host cannot be resolved."});
		} else {
			var dnsrecords = require(__dirname + "/dns-proxy-master/dns-proxy-master/config.json");
			var index = -404;
			for (var requestion in dnsrecords.requestsToForge) {
				if (dnsrecords.requestsToForge[requestion].hostName == req.query.host) {
					index = requestion;
				}
			}
			if (index < 0) {
				res.status(404).json({ok: false, err: 0002, note: "The host may be not found. "});
			} else {
				res.json({ok: true, dns: dnsrecords.requestsToForge[index], note: "To create or remove this record you must have a manage token."});
			}
		}
	} else if (req.query.action == "remove") {
		if (req.query.host == undefined) {
			res.status(404).json({ok: false, err: 0004, note: "The undefined host cannot be removed"});
		} else if (req.query.host == "myrouteradmin.net") {
			res.status(403).json({ok: false, err: 0005, note: "Haha nice try."});
		} else if (req.query.managetoken != "Sus_Amogus_AdminPass:" + configuration.AdminPassword) {
			var dnsrecords = require(__dirname + "/dns-proxy-master/dns-proxy-master/config.json");
			var index = -404;
			for (var requestion in dnsrecords.requestsToForge) {
				if (dnsrecords.requestsToForge[requestion].hostName == req.query.host) {
					index = requestion;
				}
			}
			if (index < 0) {
				res.status(404).json({ok: false, err: 0002, note: "The host may be not found. "});
			} else {
				dnsrecords.requestsToForge.splice(index, 1);
				res.status(404).json({ok: true, note: "Deleted."});
			}
			fs.writeFileSync(__dirname + "/dns-proxy-master/dns-proxy-master/config.json", JSON.stringify(dnsrecords));
		} else {
			res.status(403).json({ok: false, err: 0006, note: "Wrong token."});
		}
	} else if (req.query.action == "write") {
		if (req.query.host == undefined) {
			res.status(404).json({ok: false, err: 0007, note: "The undefined host cannot be created"});
		} else if (req.query.host == "myrouteradmin.net") {
			res.status(403).json({ok: false, err: 0005, note: "Haha nice try."});
		} else if (req.query.managetoken != "Sus_Amogus_AdminPass:" + configuration.AdminPassword) {
			var dnsrecords = require(__dirname + "/dns-proxy-master/dns-proxy-master/config.json");
			var index = -404;
			for (var requestion in dnsrecords.requestsToForge) {
				if (dnsrecords.requestsToForge[requestion].hostName == req.query.host) {
					index = requestion;
				}
			}
			if (index < 0) {
				dnsrecords.requestsToForge.push({hostName: req.query.host, ip: req.query.ip});
				res.json({ok: true, note: "Created."});
			} else {
				dnsrecords.requestsToForge[index] = {hostName: req.query.host, ip: req.query.ip}
				res.json({ok: true, note: "Overwritten."});
			}
			fs.writeFileSync(__dirname + "/dns-proxy-master/dns-proxy-master/config.json", JSON.stringify(dnsrecords));
		} else {
			res.status(403).json({ok: false, err: 0006, note: "Wrong token."});
		}
	} else {
		res.status(404).json({ok: false, err: 0003, note: "The action cannot be found."});
	}
})
app.get("/checkNet", function(req, res) {
	res.send("Router is OK!");
});
app.get("/hasToppatManagements", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
})
app.get("/management", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		fs.readFile(__dirname + "/manageServer.html", function(err, text) {
			if (err) return res.status(500).send("We ducked up. Please retry in a few minutes. If the router is still crashing, go online and ask the Router admin install the latest update.");
			var unDuckedText = text.toString();
			unDuckedText = unDuckedText.replaceAll("%serverSSID%", configuration.SSID);
			unDuckedText = unDuckedText.replaceAll("%HideIfNoToppatServer%", "<!-- This was hidden because the server is not RPE. Please install the Toppat version.");
			unDuckedText = unDuckedText.replaceAll("%EndHideIfNoToppatServer%", "This was hidden because the server is not RPE. Please install the Toppat version. -->");
			res.send(unDuckedText);
		});
	} else {
		res.redirect("/");
	}
});
app.get("/loginAttempt", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		res.redirect("/management")
	} else {
		res.cookie("adminPass", req.query.adminPass);
		res.redirect("/management");
	}
})
app.get("/certCodeAccess", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
})
app.get("/tcfiles", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
});
app.get("/downloadTC", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
});
app.get("/changeSSID", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "stop", "hostednetwork"]);
		configuration.SSID = req.query.ssid;
		configuration.WPA2 = req.query.wpa;
		setTimeout(function() {
			spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "set", "hostednetwork", "mode=allow", "ssid=\""+ configuration.SSID +"\"", "key=\"" + configuration.WPA2 + "\""]);
			setTimeout(function() {
				spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "start", "hostednetwork"]);
			}, 1000);
		}, 1000);
	} else {
		res.redirect("/");
	}
})
app.get("/stopServer", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		res.send("The network is stopping.");
		spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "stop", "hostednetwork"]);
		setTimeout(function() {
			process.exit();
		}, 1000);
	} else {
		res.redirect("/");
	}
});
app.get("/manageTF", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
});
app.get("/postToppatFile", function(req, res) { //Feature is RPE servers only. Please download Toppat version to use this feature.
	res.status(500).send("<pre>This server is not RPE. Please ask the network Administrator to install Toppat version.</pre>");
});
app.get("/logout", function(req, res) {
	if (req.cookies.adminPass == configuration.AdminPassword) {
		res.clearCookie("adminPass");
		res.redirect("/management");
	} else {
		res.redirect("/management");
	}
})

app.use(function(req, res){
	res.status(404).send("Router application cannot find this path.");
});

http.listen(80, function() {
	console.log("Your router application is running at port 80. Make sure you have Administrator permissions because it is required for hosting.");
	spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "set", "hostednetwork", "mode=allow", "ssid=\""+ configuration.SSID +"\"", "key=\"" + configuration.WPA2 + "\""]);
	setTimeout(function() {
		spawn('C:\\Windows\\System32\\netsh.exe', ["wlan", "start", "hostednetwork"]);
	}, 1000);
});