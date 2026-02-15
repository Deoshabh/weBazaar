
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const API_URL = 'http://localhost:5000/api/v1/admin/media/frames';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // We'll need a valid token, or mock it if running against local dev with auth disabled/mocked
const TEST_IMAGE_PATH = path.join(__dirname, 'test-frame.png');

async function createTestImage() {
    await sharp({
        create: {
            width: 400,
            height: 400,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
    })
    .png()
    .toFile(TEST_IMAGE_PATH);
    console.log('Created test image:', TEST_IMAGE_PATH);
}

async function testUpload() {
    try {
        if (!fs.existsSync(TEST_IMAGE_PATH)) {
            await createTestImage();
        }

        const form = new FormData();
        form.append('productSlug', 'test-shoe-360');
        
        // Append 3 frames
        for (let i = 0; i < 3; i++) {
            form.append('frames', fs.createReadStream(TEST_IMAGE_PATH));
        }

        console.log('Uploading frames...');
        
        // Note: You need a valid JWT token here if auth is enabled.
        // For local testing, you might need to temporarily disable auth or login first.
        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
                // 'Authorization': `Bearer ${ADMIN_TOKEN}` 
            }
        });

        console.log('Upload success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Upload failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    } finally {
        // Cleanup
        if (fs.existsSync(TEST_IMAGE_PATH)) fs.unlinkSync(TEST_IMAGE_PATH);
    }
}

testUpload();
