//TelegramChannel：https://t.me/nkka_404
// Define a variable called mytoken with'passwd' as the default read-write permissions
let mytoken= 'passwd';

export default {
	async fetch (request, env) {
		// If there is a TOKEN in the environment variable, assign it to mytoken, otherwise keep the default value
		mytoken = env.TOKEN || mytoken;

		let KV;
		// Check if KV (key-value store) has been set up
		if (env.KV) {
			// Assign env.KV to a constant named KV
			KV =  env.KV;
		} else {
			//throw new Error('KV Namespace not bound');
			return new Response('KV Namespace not bound', {
				status: 400,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}

		// Get the required parameters from the requested URL
		const url = new URL(request.url);
		let token;
		if (url.pathname === `/${mytoken}`){
			token = mytoken;
		} else {
			// Get the 'token' in the URL query parameter, if it does not exist, assign it to "null"
			token = url.searchParams.get('token') || "null";
		}

		// Check if the token provided matches mytoken
		if (token === mytoken) {
			const 文件名 = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;

			if (文件名 == "config" || 文件名 == mytoken) {
				const html = configHTML(url.hostname, token);
				return new Response(html, {
				  headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				  },
				});
			} else if (文件名 == "config/update.bat") {
				return new Response(下载bat(url.hostname, token), {
				  headers: {
					"Content-Disposition": `attachment; filename=update.bat`, 
					"content-type": "text/plain; charset=utf-8",
				  },
				});
			} else if (文件名 == "config/update.sh") {
				return new Response(下载sh(url.hostname, token), {
				  headers: {
					"Content-Disposition": `attachment; filename=update.sh`, 
					"content-type": "text/plain; charset=utf-8",
				  },
				});
			} else {
				// Get the 'text' and 'b64' parameters in the URL query, and set them to the values ​​if they do not exist. "null"
				const text = url.searchParams.get('text') || "null";
				const b64 = url.searchParams.get('b64') || "null";

				// If both 'text' and 'b64' are "null", read and return the file contents from KV
				if (text === "null" && b64 === "null"){
					const value = await KV.get(文件名);
					return new Response(value , {
						status: 200,
						headers: { 'content-type': 'text/plain; charset=utf-8' },
					});
				} else {
					// Check if a file exists
					await fileExists(KV, 文件名);
					
					// 如果 'b64' 为 "null" ，则以明文方式写入文件，如果 'text' 为 "null" ，则以 base64 方式写入文件
					if (b64 === "null" ){
						await KV.put(文件名, text);
						return new Response(text, {
							status: 200,
							headers: { 'content-type': 'text/plain; charset=utf-8' },
						});
					} else if (text === "null" ){
						await KV.put(文件名, base64Decode(空格替换加号(b64)));
						return new Response(base64Decode(空格替换加号(b64)), {
							status: 200,
							headers: { 'content-type': 'text/plain; charset=utf-8' },
						});
					}
				}
			}

			
		} else if (url.pathname == "/"){//Change the home page to an 404 disguise page
			return new Response(`
			<!DOCTYPE html>
			<html>
			<head>
			<title>Welcome to 404!</title>
			<style>
				body {
					width: 35em;
					margin: 0 auto;
					font-family: Arial, sans-serif;
				}
			</style>
			</head>
			<body>
			<h1>Welcome to 4̷ ̷ ̷4̷!</h1>
	<p align='center'><img src='https://github.com/nyeinkokoaung404/onlyforyou/blob/480a5b3bcc7f7862c6a1f69a61c34f4b9bf4dcdf/assets/onlyforyouall.png?raw=true' alt='' width="150" height="150" style='margin-bottom: -0px;'>
	<b style='font-size: 15px;'>Welcome! This function generates configuration for 404 protocol. If you found this useful, please join our Telegram channel for more:</b>
	<b style='font-size: 15px;'>ONLY/:FORYOU&ALL</b>
	<p>If you see this page, web server is successfully installed and
	working. Further configuration is required.</p>

	<p>For online documentation and support please refer to
	<a href="http://t.me/nkka_404/">Telegram Channel</a>.<br/>

	<p><em>Thank you for using 🤪🤪.</em></p>
			</body>
			</html>
			`, {
			  headers: {
				'Content-Type': 'text/html; charset=UTF-8',
			  },
			});
		} else {// If the token does not match, return'token is incorrect'//
			return new Response('token 有误', {
				status: 400,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}
	}
};

// Define an asynchronous function named fileExists to check whether the file exists by checking whether there is a value corresponding to filename in KV
async function fileExists(KV, filename) {
	const value = await KV.get(filename);
	return value !== null;
}

// Define a function called base64Decode to convert a base64-encoded string to utf-8-encoded characters
function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

function 空格替换加号(str) {
	str = str.replace(/ /g, '+');
	return str;
}

function 下载bat(域名,token) {
	return [
	  `@echo off`,
	  `chcp 65001`,
	  `setlocal`,
	  ``,
	  `set "DOMAIN=${域名}"`,
	  `set "TOKEN=${token}"`,
	  ``,
	  `rem %~nx1表示第一个参数的文件名和扩展名`,
	  `set "FILENAME=%~nx1"`,
	  ``,
	  `rem PowerShell命令读取文件的前65行内容，将内容转换为UTF8并进行base64编码`,
	  `for /f "delims=" %%i in ('powershell -command "$content = ((Get-Content -Path '%cd%/%FILENAME%' -Encoding UTF8) | Select-Object -First 65) -join [Environment]::NewLine; [convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))"') do set "BASE64_TEXT=%%i"`,
	  ``,
	  `rem 将内容保存到response.txt`,
	  `rem echo %BASE64_TEXT% > response.txt`,
	  ``,
	  `rem 构造带有文件名和内容作为参数的URL`,
	  `set "URL=https://%DOMAIN%/%FILENAME%?token=%TOKEN%^&b64=%BASE64_TEXT%"`,
	  ``,
	  `rem 显示请求的响应 `,
	  `rem powershell -Command "(Invoke-WebRequest -Uri '%URL%').Content"`,
	  `start %URL%`,
	  `endlocal`,
	  ``,
	  `echo 更新数据完成,倒数5秒后自动关闭窗口...`,
	  `timeout /t 5 >nul`,
	  `exit`
	].join('\r\n');
}

function 下载sh(域名,token) {
	return `#!/bin/bash
export LANG=zh_CN.UTF-8
DOMAIN="${域名}"
TOKEN="${token}"
if [ -n "$1" ]; then 
  FILENAME="$1"
else
  echo "无文件名"
  exit 1
fi
BASE64_TEXT=$(head -n 65 $FILENAME | base64 -w 0)
curl -k "https://$DOMAIN/$FILENAME?token=$TOKEN&b64=$BASE64_TEXT"
echo "更新数据完成"
`
}

function configHTML(域名, token) {
	return `
	  <html>
		<head>
		  <title>CF-Workers-TEXT2KV</title>
		</head>
		<body>
			<p align='center'><img src='https://github.com/nyeinkokoaung404/onlyforyou/blob/480a5b3bcc7f7862c6a1f69a61c34f4b9bf4dcdf/assets/onlyforyouall.png?raw=true' alt='' width="150" height="150" style='margin-bottom: -0px;'>
<b style='font-size: 15px;'>Welcome! This function generates configuration for 404 protocol. If you found this useful, please join our Telegram channel for more:</b><br>
<b style='font-size: 15px;'>ONLY/:FORYOU&ALL</b>
<a href='https://t.me/Pmttg' style="color: #fff;font-size: 15px;background-color: #5cb85c;" target='_blank'>Click To Join Telegram Channel</a>
	
		  <h1 class="centered">CF-Workers-TEXT2KV Configuration Information</h1>
		  <p class="centered">
		  Service domain name: ${域名} <br>
		  token: ${token} <br>
		  <br>
		  <pre>Note! Due to the length of the URL, the script update method can only update 65 lines of content at a time.</pre><br>
		  WindowsScreenplay: <button type="button" onclick="window.open('https://${域名}/config/update.bat?token=${token}', '_blank')">Click to download</button>
		  <br>
		  <pre>Instructions: <code>&lt;update.bat&nbsp;ip.txt&gt;</code></pre>
		  <br>
		  LinuxScreenplay: 
		  <code>&lt;curl&nbsp;https://${域名}/config/update.sh?token=${token}&nbsp;-o&nbsp;update.sh&nbsp;&&&nbsp;chmod&nbsp;+x&nbsp;update.sh&gt;</code><br>
		  <pre>Instructions: <code>&lt;./update.sh&nbsp;ip.txt&gt;</code></pre><br>
		  <br>
		  Online Document Search: <br>
		  https://${域名}/<input type="text" name="keyword" placeholder="Please enter the document you want to search">?token=${token}<br>
		  <button type="button" onclick="window.open('https://${域名}/' + document.querySelector('input[name=keyword]').value + '?token=${token}', '_blank')">View document contents</button>
		  <button type="button" onclick="navigator.clipboard.writeText('https://${域名}/' + document.querySelector('input[name=keyword]').value + '?token=${token}')">Copy document address</button>
		  </p>
	  <br>
		</body>
	  </html>
	`
}