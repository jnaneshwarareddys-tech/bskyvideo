const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const playlistUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

ffmpeg(playlistUrl)
  .inputOptions([
    '-reconnect 1',
    '-reconnect_streamed 1',
    '-reconnect_delay_max 5'
  ])
  .outputOptions([
    '-c copy',
    '-bsf:a aac_adtstoasc',
    '-f mp4'
  ])
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .on('end', () => {
    console.log('Finished successfully');
  })
  .save('test_output.mp4');
