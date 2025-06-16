#!/usr/bin/env node
var A=Object.create;var l=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var _=Object.getPrototypeOf,C=Object.prototype.hasOwnProperty;var v=(e,o,t,i)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of k(o))!C.call(e,s)&&s!==t&&l(e,s,{get:()=>o[s],enumerable:!(i=I(o,s))||i.enumerable});return e};var g=(e,o,t)=>(t=e!=null?A(_(e)):{},v(o||!e||!e.__esModule?l(t,"default",{value:e,enumerable:!0}):t,e));var c=require("@ai-sdk/anthropic"),r=require("ai"),d=require("child_process"),a=require("cleye"),h=g(require("dotenv")),u=require("util"),f=g(require("readline")),p=require("os"),y=require("path"),m=["claude-3-5-haiku-latest","claude-3-5-sonnet-latest","claude-3-7-sonnet-20250219","claude-4-sonnet-20250514","claude-4-opus-20250514"];function E(e){if(!m.includes(e))throw new Error(`Invalid model: ${e}, 
      
Available models: 
${m.join(`, 
`)}

`);return e}var R=(0,u.promisify)(d.exec),P=(0,y.join)((0,p.homedir)(),".config","autocommit",".env");console.log("configPath",P);h.default.config({path:P});var K=(0,a.cli)({commands:[(0,a.command)({name:"config",description:"Configure Anthropic API key",parameters:["<action>","[key]"],help:{examples:["config set ANTHROPIC_API_KEY=<your-api-key> // Set the API key","config get // Get the API key","config unset // Delete the API key"]}},async e=>{if(e._.action==="set"){if(console.log("Validating API key..."),!e._.key)throw new Error("Key is required when setting the API key. You can get the API key from https://console.anthropic.com/api-keys");try{let o=(0,c.createAnthropic)({apiKey:e._.key.replace("ANTHROPIC_API_KEY=","")}),{text:t}=await(0,r.generateText)({model:o("claude-3-5-haiku-latest"),prompt:"Hello"});if(t){console.log("API key is valid"),await n("mkdir -p ~/.config/autocommit"),await n("rm -f ~/.config/autocommit/.env"),await n("touch ~/.config/autocommit/.env"),await n("touch ~/.config/autocommit/.gitignore");let i=e._.key.replace("ANTHROPIC_API_KEY=","");await n(`echo 'ANTHROPIC_API_KEY=${i}' > ~/.config/autocommit/.env`),await n(`echo '.env
.env.*' > ~/.config/autocommit/.gitignore`),console.log(`API key saved successfully in ~/.config/autocommit/.env 

You can now use the aicommits command to commit your changes.

Run following command to get started: 

aicommits commit`)}}catch(o){console.error("Could not validate API key:",o),process.exit(1)}}e._.action==="get"&&(console.log("Getting API key..."),console.log(process.env.ANTHROPIC_API_KEY)),e._.action==="unset"&&(console.log("Unsetting API key..."),await n("rm -f ~/.config/autocommit/.env"),console.log("The API key has been deleted!"))}),(0,a.command)({name:"commit",description:"Commit the changes",parameters:["[prompt]"],help:{examples:["commit 'Add new feature'"]},flags:{model:{type:E,description:`Model to use. Available models: ${m.join(", ")}`,default:"claude-3-5-haiku-latest"}}},async e=>{try{if(!process.env.ANTHROPIC_API_KEY)throw new Error(`Please set the ANTHROPIC_API_KEY environment variable.
                

You can get the API key from https://console.anthropic.com/api-keys


                Run the following command: 


                echo "ANTHROPIC_API_KEY=sk-ant-api03-..." >> .env
                `);let{stdout:o}=await n("git status");o.includes("no changes added to commit")&&(console.log("You need to add changes to commit"),process.exit(0));let{stdout:t}=await n("git diff --cached");console.log("Generating commit message...");let{text:i}=await(0,r.generateText)({model:(0,c.anthropic)(e.flags.model),prompt:`Write an short and concise description of the changes you've made to the codebase. Please pack related changes together.
              If you detect a change where to user is adding a .env, node_modules or other sensitive files, please warn the user that this is not a good idea instead of writing a commit message.
              Please ignore changes to .lock files.
              ${e._.prompt?`Please take the following prompt into account for the entire commit message: ${e._.prompt}`:""}
              Please format the changes in markdown, and use the following format:
              # Changes
              - Change 1
              - Change 2
              # Reasoning
              - Reasoning for change 1
              - Reasoning for change 2
              # Summary
              - Summary of the changes
              - Summary of the reasoning
        
              The changes are:
              ${t}
              `});console.log(`

Commit message generated successfully!

`),console.log(i),console.log(`
`);let s=await x(`
Do you want to commit with this message? (y/N): `);if(s.toLowerCase()==="y"||s.toLowerCase()==="yes")try{await n(`git commit -m "${i.replace(/"/g,'\\"')}"`),console.log(`
Changes committed successfully!`)}catch(w){console.error("Failed to commit changes:",w),process.exit(1)}else console.log(`
Commit cancelled.`),process.exit(0)}catch(o){console.error("Error:",o),process.exit(1)}})]});async function n(e){try{let{stdout:o,stderr:t}=await R(e);return{stdout:o.trim(),stderr:t.trim()}}catch(o){throw new Error(`Command failed: ${o.message}`)}}function x(e){let o=f.createInterface({input:process.stdin,output:process.stdout});return new Promise(t=>{o.question(e,i=>{o.close(),t(i.trim())})})}
