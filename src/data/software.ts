export type OperatingSystem = 'linux' | 'windows' | 'macos' | 'android' | 'cross-platform';

export interface SoftwareItem {
  id: string;
  name: string;
  category: string;
  description: string;
  platforms: OperatingSystem[];
  license: string;
  officialWebsite: string;
  downloadUrl: string;
  latestVersion: string;
  lastVerifiedDate: string;
  installCommands?: {
    apt?: string;
    winget?: string;
    brew?: string;
    flatpak?: string;
  };
}

export const VERIFIED_SOFTWARE: SoftwareItem[] = [
  {
    id: 'obs-studio',
    name: 'OBS Studio',
    category: 'Video & Streaming',
    description: 'Free and open source software for video recording and live streaming on Twitch, YouTube, and more.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'GPL-2.0',
    officialWebsite: 'https://obsproject.com',
    downloadUrl: 'https://obsproject.com/download',
    latestVersion: '30.2.3',
    lastVerifiedDate: '2026-10-15',
    installCommands: {
      apt: 'sudo add-apt-repository ppa:obsproject/obs-studio && sudo apt install obs-studio',
      winget: 'winget install OBSProject.OBSStudio',
      brew: 'brew install --cask obs',
      flatpak: 'flatpak install flathub com.obsproject.Studio',
    },
  },
  {
    id: 'vlc',
    name: 'VLC Media Player',
    category: 'Media & Audio',
    description: 'A free, open-source, cross-platform multimedia player that plays most multimedia files, DVDs, and audio CDs.',
    platforms: ['linux', 'windows', 'macos', 'android'],
    license: 'GPL-2.0',
    officialWebsite: 'https://www.videolan.org',
    downloadUrl: 'https://www.videolan.org/vlc/',
    latestVersion: '3.0.21',
    lastVerifiedDate: '2026-10-10',
    installCommands: {
      apt: 'sudo apt install vlc',
      winget: 'winget install VideoLAN.VLC',
      brew: 'brew install --cask vlc',
      flatpak: 'flatpak install flathub org.videolan.VLC',
    },
  },
  {
    id: '7-zip',
    name: '7-Zip',
    category: 'File Compression',
    description: 'High compression ratio file archiver supporting 7z, ZIP, RAR, TAR, GZ, and ISO formats.',
    platforms: ['windows', 'linux'],
    license: 'GNU LGPL',
    officialWebsite: 'https://www.7-zip.org',
    downloadUrl: 'https://www.7-zip.org/download.html',
    latestVersion: '24.09',
    lastVerifiedDate: '2026-09-28',
    installCommands: {
      winget: 'winget install 7zip.7zip',
      apt: 'sudo apt install p7zip-full',
      brew: 'brew install sevenzip',
    },
  },
  {
    id: 'gimp',
    name: 'GIMP',
    category: 'Graphics & Design',
    description: 'GNU Image Manipulation Program for photo retouching, image composition, and graphic authoring.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'GPL-3.0',
    officialWebsite: 'https://www.gimp.org',
    downloadUrl: 'https://www.gimp.org/downloads/',
    latestVersion: '2.10.38',
    lastVerifiedDate: '2026-10-01',
    installCommands: {
      apt: 'sudo apt install gimp',
      winget: 'winget install GIMP.GIMP',
      brew: 'brew install --cask gimp',
      flatpak: 'flatpak install flathub org.gimp.GIMP',
    },
  },
  {
    id: 'keepassxc',
    name: 'KeePassXC',
    category: 'Security & Passwords',
    description: 'Secure, offline, open-source password manager with cross-platform synchronization and AES-256 encryption.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'GPL-3.0',
    officialWebsite: 'https://keepassxc.org',
    downloadUrl: 'https://keepassxc.org/download/',
    latestVersion: '2.7.9',
    lastVerifiedDate: '2026-10-20',
    installCommands: {
      apt: 'sudo apt install keepassxc',
      winget: 'winget install KeePassXCTeam.KeePassXC',
      brew: 'brew install --cask keepassxc',
      flatpak: 'flatpak install flathub org.keepassxc.KeePassXC',
    },
  },
  {
    id: 'handbrake',
    name: 'HandBrake',
    category: 'Video Conversion',
    description: 'Open-source video transcoder for converting video from nearly any format to modern, widely supported codecs.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'GPL-2.0',
    officialWebsite: 'https://handbrake.fr',
    downloadUrl: 'https://handbrake.fr/downloads.php',
    latestVersion: '1.8.2',
    lastVerifiedDate: '2026-09-15',
    installCommands: {
      apt: 'sudo apt install handbrake',
      winget: 'winget install HandBrake.HandBrake',
      brew: 'brew install --cask handbrake',
      flatpak: 'flatpak install flathub fr.handbrake.ghb',
    },
  },
  {
    id: 'neovim',
    name: 'Neovim',
    category: 'Developer Tools',
    description: 'Vim-fork focused on extensibility and usability, featuring full Lua scripting and Language Server Protocol (LSP) support.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'Apache-2.0',
    officialWebsite: 'https://neovim.io',
    downloadUrl: 'https://github.com/neovim/neovim/releases',
    latestVersion: '0.10.2',
    lastVerifiedDate: '2026-10-18',
    installCommands: {
      apt: 'sudo apt install neovim',
      winget: 'winget install Neovim.Neovim',
      brew: 'brew install neovim',
      flatpak: 'flatpak install flathub io.neovim.nvim',
    },
  },
  {
    id: 'blender',
    name: 'Blender',
    category: '3D & VFX',
    description: 'Free and open-source 3D creation suite supporting modeling, rigging, animation, simulation, rendering, and compositing.',
    platforms: ['linux', 'windows', 'macos'],
    license: 'GPL-3.0',
    officialWebsite: 'https://www.blender.org',
    downloadUrl: 'https://www.blender.org/download/',
    latestVersion: '4.2.3 LTS',
    lastVerifiedDate: '2026-10-22',
    installCommands: {
      apt: 'sudo apt install blender',
      winget: 'winget install BlenderFoundation.Blender',
      brew: 'brew install --cask blender',
      flatpak: 'flatpak install flathub org.blender.Blender',
    },
  },
];
