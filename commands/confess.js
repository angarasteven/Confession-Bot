// commands/confession.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');
const mongoose = require('mongoose');
const Confession = require('../models/Confession');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(chalk.green('Connected to MongoDB')))
    .catch(err => console.error(chalk.red('Failed to connect to MongoDB'), err));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confession')
        .setDescription('Submit an anonymous confession')
        .addStringOption(option =>
            option.setName('confession')
                .setDescription('Your confession')
                .setRequired(true)
        ),
    async execute(interaction) {
        const confession = interaction.options.getString('confession');
        const confessionChannel = interaction.client.channels.cache.get(process.env.CONFESSION_CHANNEL_ID);
        const confessionLogs = interaction.client.channels.cache.get(process.env.CONFESSION_LOGS_CHANNEL_ID);

        const confessionCount = await Confession.countDocuments();
        const newConfessionId = confessionCount + 1;

        const newConfession = new Confession({
            confessionId: newConfessionId,
            confession,
            author: interaction.user.id,
            responses: [],
        });

        await newConfession.save();

        const confessionEmbed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle(`📝 Anonymous Confession #${newConfessionId}`)
            .setDescription(`${confession}`)
            .setFooter({ text: `To respond to this confession, use /confessreply ${newConfessionId}` })
            .setTimestamp();

        const confessionMessage = await confessionChannel.send({ embeds: [confessionEmbed] });

        const logEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`📝 New Confession Logged`)
            .setDescription(`${confession}`)
            .addFields(
                { name: '👤 Confessed by', value: interaction.client.users.cache.get(interaction.user.id)?.tag || 'Anonymous' },
                { name: '📄 Confession ID', value: `#${newConfessionId}` }
            )
            .setFooter({ text: 'Confession Bot' })
            .setTimestamp();

        await confessionLogs.send({ embeds: [logEmbed] });

        await interaction.reply({ content: `${chalk.green('✅ Your confession has been submitted anonymously!')} ${chalk.blue('🙏 May your soul find peace.')}`, ephemeral: true });
        console.log(chalk.blue(`[Confession Bot] New confession submitted by ${interaction.user.tag}`));
    }
};