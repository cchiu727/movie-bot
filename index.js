const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// create collection of commands
client.commands = new Collection();

//
const commandPaths = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPaths).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandPaths, file);
    const command = require(filePath);
    // set a new item in the collection with the key and as the command name and value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// when client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true});
    }
});

// log into Discord with your client's token
client.login(token)