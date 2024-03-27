// commands/confessreply.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');
const mongoose = require('mongoose');
const Confession = require('../models/Confession');
const Response = require('../models/Response');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(chalk.green('Connected to MongoDB')))
    .catch(err => console.error(chalk.red('Failed to connect to MongoDB'), err));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confessreply')
        .setDescription('Reply to an anonymous confession')
        .addIntegerOption(option =>
            option.setName('confessionid')
                .setDescription('The confession ID to reply to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('response')
                .setDescription('Your response')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Whether the response should be anonymous or not')
                .setRequired(false)
        ),
    async execute(interaction) {
        const confessionId = interaction.options.getInteger('confessionid');
        const response = interaction.options.getString('response');
        const isAnonymous = interaction.options.getBoolean('anonymous') ?? true; // Default to true if not provided
        const confessionChannel = interaction.client.channels.cache.get(process.env.CONFESSION_CHANNEL_ID);
        const confessionLogs = interaction.client.channels.cache.get(process.env.CONFESSION_LOGS_CHANNEL_ID);

        const confession = await Confession.findOne({ confessionId });

        if (!confession) {
            return interaction.reply({ content: `No confession found with ID #${confessionId}`, ephemeral: true });
        }

        confession.responses.push(response);
        await confession.save();

        const newResponse = new Response({
            confessionId,
            response,
            author: isAnonymous ? 'Anonymous' : interaction.user.id,
        });

        await newResponse.save();

        const responseEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`📝 Anonymous Confession #${confessionId}`)
            .setDescription(`${confession.confession}\n\n**${isAnonymous ? 'Anonymous' : `${interaction.user.tag}`} Member Response:**\n${response}`)
            .setFooter({ text: 'Confession Bot' })
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`📝 New Response Logged`)
            .setDescription(`${response}`)
            .addFields(
                { name: '👤 Responded by', value: isAnonymous ? 'Anonymous' : interaction.client.users.cache.get(newResponse.author)?.tag || 'Unknown' },
                { name: '📄 Confession ID', value: `#${confessionId}` }
            )
            .setFooter({ text: 'Confession Bot' })
            .setTimestamp();

        await confessionChannel.send({ embeds: [responseEmbed] });
        await confessionLogs.send({ embeds: [logEmbed] });

        await interaction.reply({ content: `${chalk.green('✅ Your response has been submitted!')}${isAnonymous ? '' : ` ${chalk.blue('(Your response is not anonymous)')}`}`, ephemeral: true });
        console.log(chalk.blue(`[Confession Bot] New ${isAnonymous ? 'anonymous' : 'non-anonymous'} response submitted by ${interaction.user.tag} for Confession #${confessionId}`));
    }
};