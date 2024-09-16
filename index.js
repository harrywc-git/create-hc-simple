#!/usr/bin/env node
import {mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from "fs";
import { createInterface } from "readline";
import { execSync } from "child_process";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise((resolve) => {
        prompt.question(query, (answer) => {
            resolve(answer);
        });
    });
}

const createTemplateFiles = (templatePath, targetPath) => {
    const filesToCreate = readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const filePath = `${templatePath}/${file}`;
        const stats = statSync(filePath);
        if (stats.isFile()) {
            const contents = readFileSync(filePath, "utf8");
            writeFileSync(`${process.cwd()}/${targetPath}/${file}`, contents, "utf8");
        } else if (stats.isDirectory()) {
            mkdirSync(`${process.cwd()}/${targetPath}/${file}`);
            createTemplateFiles(`${templatePath}/${file}`, `${targetPath}/${file}`);
        }
    });
};

const isBunInstalled = () => {
    try {
        execSync("bun --version", { stdio: "ignore" });
        return true;
    } catch (error) {
        return false;
    }
};

const installBun = () => {
    console.log("Installing Bun...");
    execSync("curl -fsSL https://bun.sh/install | bash", { stdio: "inherit" });
};

async function main() {
    let projectName = await askQuestion("Project name? (hc-simple): ");
    if (projectName === "") {
        projectName = "hc-simple";
    }

    mkdirSync(`${process.cwd()}/${projectName}`);
    createTemplateFiles(`${__dirname}/templates/simple`, projectName);

    if (!isBunInstalled()) {
        const installBunAnswer = await askQuestion("Install Bun? y/n: ");
        if (installBunAnswer.toLowerCase() === "y") {
            installBun();
        }
    }

    execSync(`cd ${process.cwd()}/${projectName} && bun install`, { stdio: "inherit" });
    
    prompt.close();
};

main();

