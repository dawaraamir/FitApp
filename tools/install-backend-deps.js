#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const requirementsPath = join(process.cwd(), 'backend', 'requirements.txt');

if (!existsSync(requirementsPath)) {
  console.error('Missing backend/requirements.txt. Run "git pull --rebase" to sync your repository, then retry.');
  process.exit(1);
}

const pythonCommands = ['python3', 'python'];

function runPython(index) {
  if (index >= pythonCommands.length) {
    console.error('Could not locate a Python interpreter. Install Python 3.9+ and ensure it is on your PATH.');
    process.exit(1);
  }

  const command = pythonCommands[index];
  const child = spawn(command, ['-m', 'pip', 'install', '-r', requirementsPath], { stdio: 'inherit' });

  child.on('exit', (code) => {
    if (code === 0) {
      process.exit(0);
    }

    if (code === 127) {
      runPython(index + 1);
      return;
    }

    console.error(`"${command}" exited with code ${code}.`);
    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      runPython(index + 1);
    } else {
      console.error(`Failed to run "${command}": ${error.message}`);
      process.exit(1);
    }
  });
}

runPython(0);
