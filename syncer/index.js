require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const db = require('quick.db');
const { WebClient } = require('@slack/web-api');
const client = new WebClient();
const request = require('sync-request');
const fs = require("fs")

app.use(express.static('public'))
function cron(){
    if (!db.has("tokens")) return
    var keys = Object.keys(db.get("tokens"))
    keys.forEach(async key=>{
        const cache = db.get("tokens")[key]
        var req = request('GET', `${process.env.SCRAPBOOK}/api/users/${key}`);
const res = JSON.parse(req.getBody("utf8"))
if (res.status) return db.delete(`tokens.${key}`)
        const web = new WebClient(cache.code);
        var done = false
        res.posts.forEach(async (post, i)=>{

        
           console.log(cache)
           console.log(post.id)
           console.log(`is last: ${post.id <= cache.last}`)
           // why this horrendus code? sqlite gets busy and it's super annoying
           if (cache.last && post.id == cache.last) return db.set(`tokens.${key}.last`, res.posts[0].id) 
           if (cache.last && post.id <= cache.last) return 
        
            if (post.attachments){
               var stream = request("GET", `${process.env.SCRAPBOOK}/${post.attachments}`).getBody()
               console.log(stream)
               await web.files.uploadV2({
                file: stream,
                filename: 'scrapbook_file.png',
                channel_id: process.env.SLACK_CHANNEL_ID,
                initial_comment: post.text,
              });
            } else {
                await web.chat.postMessage({
                    channel: process.env.SLACK_CHANNEL_ID,
                    text: post.text                
                });
            }
        
        })
   
    })
}
if (process.env.SYNC_ENABLED){
    setInterval(cron, process.env.SYNC_INTERVAL || 60000)
    cron()
}

app.get('/', async (_, res) => {
    const scopes = "chat:write,channels:read"; // don't mix other non-`identity.` scopes here
    const url = `https://slack.com/oauth/v2/authorize?user_scope=${scopes}&client_id=${process.env.SLACK_CLIENT_ID}&redirect_uri=${process.env.SLACK_AUTH_HOST}/callback`;
  
    res.status(200)
      .header('Content-Type', 'text/html; charset=utf-8')
      .send(
        `<!DOCTYPE html>
      <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
        :root {
            font-family: system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        body {
            padding-right: 3.5vw;
            margin-left: auto;
            margin-right: auto;
            max-width: 42rem;
            padding: 2.625rem 1.3125rem;
            padding-top: 0;
          }
        </style>
      </head>
      <body>
      <h1>Link your scrapbook to slack</h1>
      <p>Do you want to keep your scrapbook streak? Do you want to update #scrapbook with the crazy and fun adventures you're having here? Click the button below to link your Slack account to the offline scrapbook!</p>
      <a href="${url}"><img alt="Sign in with Slack" height="40" width="172" src="/sign_in_with_slack.png" srcset="/sign_in_with_slack.png 1x, /sign_in_with_slack@2x.png 2x" /></a>
      </body>
      </html>`);
  });
app.get('/link', async (req, resp) => {
const { code, name } = req.query
if (!code) return resp.json({ success: false, message: "You need to provide the code. Try authorizing again." })
if (!name) return resp.json({ success: false, message: "Please provide a name" })
var req = request('GET', `${process.env.SCRAPBOOK}/api/users/${name}`);
const res = JSON.parse(req.getBody("utf8"))
if (res.status) return resp.json({ success: false, message: "Are you sure you type in the right username?" })

db.set(`tokens.${name}.code`, code)
resp.json({ success: true, message: "Successfully saved! You may leave this page"})
})
app.get('/callback', async (req, res) => {
    try {
      const response = await client.oauth.v2.access({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: `${process.env.SLACK_AUTH_HOST}/callback`
      });

      res.send(`<!DOCTYPE html>
      <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/blocks.css" />
        <style>
        :root {
            font-family: system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        body {
            padding-right: 3.5vw;
            margin-left: auto;
            margin-right: auto;
            max-width: 42rem;
            padding: 2.625rem 1.3125rem;
            padding-top: 0;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        .usernamesave {
            display: flex;
            flex-drection: row;
            align-items: center;
        }
        .searchButton {
            height: 36px;
            line-height: 18px;
        }
        .username {
            border: 0;
            font-size: 1em;
            box-sizing: border-box;
            padding: 6px 8px;
        }
        </style>
      </head>
      <body>
      <h1>One more step</h1>
      What's your offline scrapbook username? It's not your slack username, it is what appears when you add a new post to the scrapbook.
      <br><br>
      <img src="/whereitis.png"></img>
      <br>
      <div class="usernamesave">
        <div class="fixed wrapper block">
            <input type="text" placeholder="Username" id="username" class="username">
        </div>
        <button class="accent block searchButton" onclick="submitForm()">Save</button>
      </div>
      <script>
      function submitForm(){
       const username = document.querySelector("#username").value
       const code = "${response.authed_user.access_token}"

       fetch("/link?" + new URLSearchParams({
        name: username,
        code: code
    })).then(r=>r.json()).then(r=>{
        alert(r.message)
       })
      }
      </script>
      </body>
      </html>`)
    } catch (e) {
      console.error(e);
      res.redirect("/") // expired token
    }
   
  });

app.listen(port, () => {
    console.log(`Scrapbook linker listening on port ${port}`)
})