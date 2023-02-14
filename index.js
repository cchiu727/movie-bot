/*
    Create a client instance for the bot and log into discord
    `GatewayIntentBits.Guilds` intents option is necessary for discord.js client to work as expected
    Ensures caches for guilds, channels, and roles are populated and available for internal use

    Note: "guild" is used by Discord API and discord.js to refer to a Discord server
*/

// Require the necessary discord.js classes
const fs = require('node:fs'); // fs module is Node's native file system, used to read the commands directory and identify command files
const path = require('node:path'); // path module is Node's native path utility module, helps construct paths to access files and directories
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection(); // Collection class extends JS's Map class

//
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // set a new item in the collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// when client is ready, run this code (only once)
// we use c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command', ephemeral: true });
    }

});

// log into Discord with your client's token
client.login(token);