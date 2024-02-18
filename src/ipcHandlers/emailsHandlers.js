const { ipcMain } = require("electron");
const https = require("https");

const registerEmailHandlers = () => {
  ipcMain.on("solicitar-token", (event) => {
    const tenantId = "f8cdef31-a31e-4b4a-93e4-5f571e91255a";
    const clientId = "ba2b6057-1cca-410f-984f-6f74c64d6ab3";
    const clientSecret = "NHR8Q~oJJMq4ooCJMUQVAmdpLT2Pvnq4u4c.namG";
    const scope = "https://graph.microsoft.com/.default";
    const grantType = "client_credentials";

    const postData = new URLSearchParams({
      client_id: clientId,
      scope: scope,
      client_secret: clientSecret,
      grant_type: grantType,
    }).toString();

    const options = {
      hostname: "login.microsoftonline.com",
      path: `/${tenantId}/oauth2/v2.0/token`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const accessToken = response.access_token;
          event.reply("cargar-token", { accessToken });
        } catch (error) {
          console.error("Error parsing token response:", error);
          event.reply("cargar-token", { error: error.message });
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error obtaining access token:", error);
      event.reply("cargar-token", { error: error.message });
    });

    req.write(postData);
    req.end();
  });

  ipcMain.on("solicitar-emails", (event, { accessToken }) => {
    const options = {
      hostname: "graph.microsoft.com",
      path: "v1.0/users/controlmedicionposo@outlook.com/messages",
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          console.log(`data`, data);
          const response = JSON.parse(data);
          const messages = response.value;
          event.reply("cargar-emails", { messages });
        } catch (error) {
          console.error("Error reading mails:", error);
          event.reply("cargar-emails", { error: error.message });
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error on request:", error);
      event.reply("cargar-emails", { error: error.message });
    });

    req.end();
  });
};

module.exports = { registerEmailHandlers };
