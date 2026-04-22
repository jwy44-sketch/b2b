Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\Johnathan Youngblood\OneDrive\Documents\Playground"
shell.Run "cmd /c cd /d ""C:\Users\Johnathan Youngblood\OneDrive\Documents\Playground"" && ""C:\Users\Johnathan Youngblood\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"" -m http.server 8000 --bind 127.0.0.1", 0, False
