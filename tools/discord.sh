#!/bin/bash

unzip ./DiscordChatExporter.CLI.zip -d dce
dotnet dce/DiscordChatExporter.Cli.dll exportguild -o ../discord -b -g 779354026298179604 -f JSON
