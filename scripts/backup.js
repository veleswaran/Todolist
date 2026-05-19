const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { google } = require('googleapis');

// Configuration
const MONGO_URI = "mongodb+srv://veleswaran:Vels344@cluster0.nlwhzwz.mongodb.net/?appName=Cluster0";
const DB_NAME = "TodoList";
const COLLECTION_NAME = "todos";
const CREDENTIALS_PATH = path.join(__dirname, '../google-drive-key.json');
const TEMP_DIR = path.join(__dirname, '../backup-temp');

// Helper to format date for file name: YYYY-MM-DD
function getFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function runBackup() {
  console.log(`[${new Date().toISOString()}] Starting Daily Google Drive Backup...`);

  // 1. Check for Google Service Account credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("\n=======================================================================");
    console.error("❌ BACKUP FAILED: 'google-drive-key.json' is missing in the project root!");
    console.error("-----------------------------------------------------------------------");
    console.error("To fix this and enable your automatic backups, please:");
    console.error("1. Go to Google Cloud Console, enable the Google Drive API.");
    console.error("2. Create a Service Account, generate a JSON Key, and download it.");
    console.error("3. Save it as 'google-drive-key.json' in the root directory:");
    console.error("   " + path.resolve(CREDENTIALS_PATH));
    console.error("4. Share your Google Drive backup folder with the service account email.");
    console.error("=======================================================================\n");
    process.exit(1);
  }

  let mongoClient;
  let tempFilePath = '';

  try {
    // 2. Connect to MongoDB and fetch todos
    console.log("Connecting to MongoDB Atlas...");
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    
    console.log("Fetching todos from database...");
    const db = mongoClient.db(DB_NAME);
    const todos = await db.collection(COLLECTION_NAME).find({}).toArray();
    console.log(`Found ${todos.length} todo items to backup.`);

    // Ensure temp directory exists
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Write to a temporary JSON file
    const dateStr = getFormattedDate();
    const fileName = `todo-backup-${dateStr}.json`;
    tempFilePath = path.join(TEMP_DIR, fileName);
    
    fs.writeFileSync(tempFilePath, JSON.stringify(todos, null, 2), 'utf8');
    console.log(`Generated local backup file: ${fileName}`);

    // 3. Authenticate with Google Drive
    console.log("Authenticating with Google Drive API...");
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 4. Get or Create backup folder 'TodoBackups'
    console.log("Searching for 'TodoBackups' folder on Google Drive...");
    const listResponse = await drive.files.list({
      q: "name = 'TodoBackups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    let folderId = '';
    const folders = listResponse.data.files;
    if (folders && folders.length > 0) {
      folderId = folders[0].id;
      console.log(`Found existing Google Drive backup folder (ID: ${folderId})`);
    } else {
      console.log("Backup folder 'TodoBackups' not found. Creating it...");
      const folderMetadata = {
        name: 'TodoBackups',
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });
      folderId = folder.data.id;
      console.log(`Created new Google Drive backup folder (ID: ${folderId})`);
    }

    // 5. Upload backup file to Google Drive
    console.log(`Uploading ${fileName} to Google Drive folder...`);
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream(tempFilePath),
    };

    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ SUCCESS: Uploaded backup file to Google Drive!`);
    console.log(`- File Name: ${uploadResponse.data.name}`);
    console.log(`- File ID: ${uploadResponse.data.id}`);
    console.log(`- Access Link: ${uploadResponse.data.webViewLink}`);

  } catch (error) {
    console.error("❌ ERROR DURING BACKUP EXECUTION:", error);
    process.exit(1);
  } finally {
    // 6. Cleanup MongoDB connection and local backup file
    if (mongoClient) {
      await mongoClient.close();
      console.log("Closed MongoDB connection.");
    }
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Cleaned up temporary local backup file.");
    }
    console.log(`[${new Date().toISOString()}] Backup workflow finished.\n`);
  }
}

runBackup();
