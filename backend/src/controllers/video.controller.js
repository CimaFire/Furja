const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');

// Process video upload
const processVideo = async (req, res) => {
  try {
    const { streamId } = req.body;

    if (!streamId || !/^\d+$/.test(String(streamId))) {
      return res.status(400).json({ error: 'Invalid stream ID' });
    }
    const videoFile = req.files?.video;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputDir = path.join(__dirname, '../../hls');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `stream-${streamId}`);

    // Process video with FFmpeg
    ffmpeg(videoFile.data)
      .output(`${outputPath}/playlist.m3u8`)
      .outputOptions([
        '-c:v libx264',
        '-crf 21',
        '-c:a aac',
        '-hls_time 10',
        '-hls_list_size 0'
      ])
      .on('error', (err) => {
        res.status(500).json({ error: 'Video processing failed' });
      })
      .on('end', () => {
        res.json({ message: 'Video processed successfully', path: `${outputPath}/playlist.m3u8` });
      })
      .run();
  } catch (error) {
    res.status(500).json({ error: 'Failed to process video' });
  }
};

// Generate thumbnails
const generateThumbnail = async (req, res) => {
  try {
    const { streamId } = req.body;

    if (!streamId || !/^\d+$/.test(String(streamId))) {
      return res.status(400).json({ error: 'Invalid stream ID' });
    }

    const videoFile = req.files?.video;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputDir = path.join(__dirname, '../../thumbnails');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `thumbnail-${streamId}.png`);

    ffmpeg(videoFile.data)
      .screenshots({
        timestamps: ['00:00:05'],
        filename: `thumbnail-${streamId}.png`,
        folder: outputDir,
        size: '320x180'
      })
      .on('end', () => {
        res.json({ message: 'Thumbnail generated', path: outputPath });
      })
      .on('error', (err) => {
        res.status(500).json({ error: 'Failed to generate thumbnail' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
};

module.exports = {
  processVideo,
  generateThumbnail
};
