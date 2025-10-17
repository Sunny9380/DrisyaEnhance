import fs from 'fs/promises';
import path from 'path';

async function createUploadsDirectories() {
  try {
    const directories = [
      'uploads',
      'uploads/templates',
      'uploads/avatars',
      'uploads/generated'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        if (error.code === 'EEXIST') {
          console.log(`📁 Directory already exists: ${dir}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 All upload directories are ready!');
    console.log('📂 Directory structure:');
    console.log('  uploads/');
    console.log('  ├── templates/     (for template thumbnail images)');
    console.log('  ├── avatars/       (for user profile pictures)');
    console.log('  └── generated/     (for AI-generated images)');

  } catch (error) {
    console.error('❌ Error creating directories:', error.message);
  }
}

// Run the script
createUploadsDirectories();
