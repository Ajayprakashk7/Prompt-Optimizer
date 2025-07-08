// Service to handle Chrome extension download
export const downloadChromeExtension = async (): Promise<void> => {
  try {
    // Create installation instructions with more detailed info
    const extensionData = {
      name: 'Prompt Optimizer Chrome Extension',
      version: '1.0.0',
      description: 'Transform your ideas into exceptional AI prompts directly from your browser',
      installationSteps: [
        '📥 INSTALLATION STEPS:',
        '',
        '1. Go to: https://your-domain.com/extension-download',
        '   (or contact the developer for extension files)',
        '',
        '2. Download and extract the extension ZIP file',
        '',
        '3. Open Google Chrome',
        '',
        '4. Navigate to: chrome://extensions/',
        '',
        '5. Enable "Developer mode" (toggle in top-right corner)',
        '',
        '6. Click "Load unpacked" button',
        '',
        '7. Select the extracted extension folder',
        '',
        '8. The Prompt Optimizer extension is now installed!',
        '',
        '🎯 USAGE:',
        '• Click the extension icon in your toolbar',
        '• Enter prompts directly in the popup',
        '• Enjoy the same great features in a convenient popup!',
        '',
        '⭐ FEATURES:',
        '• 3 free optimizations per day with built-in AI',
        '• Add your own Google Gemini API key for unlimited use',
        '• Multiple personas and writing styles',
        '• Copy optimized prompts with one click',
        '• Works offline after initial setup',
      ]
    };

    const instructionsText = `${extensionData.name} v${extensionData.version}

${extensionData.description}

${extensionData.installationSteps.join('\n')}

---
📧 Need Help?
Contact: https://ajayprakash.dev
Created with ❤️ by Ajay Prakash

🌟 Enjoy using Prompt Optimizer!
`;

    // Create and download the instructions file
    const blob = new Blob([instructionsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompt-optimizer-chrome-extension-setup.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    const message = `📋 Installation guide downloaded!

The Chrome extension setup instructions have been saved to your Downloads folder.

🚀 Coming Soon: One-click install from Chrome Web Store!

For now, follow the detailed instructions in the downloaded file to manually install the extension.`;
    
    alert(message);
    
  } catch (error) {
    console.error('Error downloading extension setup guide:', error);
    alert('❌ Error preparing setup guide. Please try again or contact support.');
  }
};

// Check if we're in the web app (not extension context)
export const isWebApp = (): boolean => {
  return !(window as any).chrome?.runtime?.id && window.location.protocol.startsWith('http');
};
