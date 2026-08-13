from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    output = Path("artifacts/ui-smoke")
    output.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto("http://127.0.0.1:3100", wait_until="domcontentloaded")
        page.get_by_role("heading", name="工作日誌", exact=True).wait_for()
        page.wait_for_timeout(600)
        page.screenshot(path=str(output / "home-mobile.png"), full_page=True)

        page.goto("http://127.0.0.1:3100/admin", wait_until="domcontentloaded")
        page.get_by_role("heading", name="主管登入").wait_for()
        page.wait_for_timeout(600)
        page.screenshot(path=str(output / "admin-mobile.png"), full_page=True)
        page.get_by_placeholder("請輸入密碼").fill("1234")
        page.get_by_role("button", name="登入").click()
        page.get_by_role("heading", name="智慧管理後台").wait_for()
        page.get_by_role("button", name="成本儀表板").click()
        page.get_by_text("案場總成本分配").wait_for()
        page.screenshot(path=str(output / "dashboard-mobile.png"), full_page=True)
        browser.close()

    relevant = [error for error in errors if "favicon" not in error.lower()]
    if relevant:
        raise RuntimeError(f"browser console errors: {relevant}")
    print("UI_SMOKE_OK home=/ admin=/admin viewport=390x844 console_errors=0")


if __name__ == "__main__":
    main()
