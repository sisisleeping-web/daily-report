import os
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    base_url = os.environ.get("E2E_BASE_URL", "http://127.0.0.1:3100").rstrip("/")
    output = Path("artifacts/ui-smoke")
    output.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(base_url, wait_until="domcontentloaded")
        page.get_by_role("heading", name="工作日誌", exact=True).wait_for()
        page.wait_for_timeout(600)
        page.screenshot(path=str(output / "home-mobile.png"), full_page=True)

        page.goto(f"{base_url}/admin", wait_until="domcontentloaded")
        page.get_by_role("heading", name="主管登入").wait_for()
        page.wait_for_timeout(600)
        page.screenshot(path=str(output / "admin-mobile.png"), full_page=True)
        email = os.environ.get("E2E_ADMIN_EMAIL")
        password = os.environ.get("E2E_ADMIN_PASSWORD")
        if not email or not password:
            raise RuntimeError("E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required")
        page.get_by_placeholder("主管帳號").fill(os.environ.get("E2E_ADMIN_USERNAME", "wei"))
        page.get_by_placeholder("請輸入密碼").fill(password)
        page.get_by_role("button", name="登入").click()
        page.get_by_role("heading", name="智慧管理後台").wait_for()
        page.get_by_role("button", name="成本儀表板").click()
        page.get_by_text("案場總成本分配").wait_for()
        page.screenshot(path=str(output / "dashboard-mobile.png"), full_page=True)
        page.get_by_role("button", name="人員／車輛管理").click()
        page.get_by_role("heading", name="人員清單管理").wait_for()
        page.get_by_role("button", name="新增", exact=True).first.wait_for()
        page.get_by_role("button", name="修改", exact=True).first.wait_for()
        page.get_by_role("button", name="移除", exact=True).first.wait_for()
        page.screenshot(path=str(output / "settings-mobile.png"), full_page=True)
        browser.close()

    relevant = [error for error in errors if "favicon" not in error.lower()]
    if relevant:
        raise RuntimeError(f"browser console errors: {relevant}")
    print("UI_SMOKE_OK home=/ admin=/admin viewport=390x844 console_errors=0")


if __name__ == "__main__":
    main()
