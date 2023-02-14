const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie')
        .setDescription('Search IMDb for your movie')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Movie title')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.reply('COMMAND WIP');
    },
};