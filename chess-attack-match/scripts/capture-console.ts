import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/'

async function main() {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    page.on('console', (msg) => {
        console.log('[browser]', msg.type().toUpperCase(), msg.text())
    })

    page.on('pageerror', (error) => {
        console.error('[pageerror]', error)
    })

    page.on('requestfailed', (request) => {
        console.error('[requestfailed]', request.url(), request.failure())
    })

    await page.goto(url, { waitUntil: 'load', timeout: 60000 })

    await page.waitForTimeout(5000)

    await browser.close()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})


