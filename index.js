// index.js
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const { REST } = require('discord.js');
const chalk = require('chalk');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

client.once('ready', async () => {
    console.log(chalk.green(`Ready! Logged in as ${client.user.tag}`));

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log(chalk.blue('Started refreshing application (/) commands.'));

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: client.commands.map(command => command.data.toJSON()) },
        );

        console.log(chalk.green('Successfully registered application commands.'));
        console.log(chalk.blue('Loaded Commands:'));
        client.commands.forEach(command => {
            console.log(chalk.blue(`- ${command.data.name}`));
        });
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(TOKEN);
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
