import pytest
from playwright.sync_api import sync_playwright
#account for testing plants owner 
USERNAME = ""
PASSWORD = ""

@pytest.fixture(scope="function")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  
        yield browser
        browser.close()


def login(page):
    page.goto('http://localhost:8080/auth')
    page.fill('input[type="email"]', USERNAME)
    page.fill('input[type="password"]', PASSWORD)
    page.click('button[type="submit"]')
    while page.url != 'http://localhost:8080/plants':
        page.click("a[href='/plants']")
        page.wait_for_timeout(2000)

    page.wait_for_url('http://localhost:8080/plants')
def test_add_plant_dialog(browser):
    page = browser.new_page()
    login(page)
    page.click('button:has-text("Add Plant")')
    page.fill('input[id="name"]', 'Cactus')
    page.fill('input[id="species"]', 'Cactaceae')
    page.fill('input[id="age"]', '5')
    page.fill('input[id="height"]', '30')
    page.fill('input[id="width"]', '15')
    page.fill('textarea[id="description"]', 'A small cactus plant')
    page.click('button[type="submit"]')

    assert 'Cactus' in page.content()
    page.close()
def test_search_plant(browser):
    page = browser.new_page()
    login(page)
    page.fill('input[placeholder="Search plants by name or species..."]', 'Cactus')
    page.press('input[placeholder="Search plants by name or species..."]', 'Enter')
    assert 'Cactus' in page.content()
    page.close()
def test_update_plant(browser):
    page = browser.new_page()
    login(page)

    plant_row = page.locator('text=Cactus').locator('..').locator('button:has-text("Edit")')
    plant_row.click()

    page.fill('input[id="name"]', 'Updated Cactus')
    page.fill('textarea[id="description"]', 'Updated description of the cactus plant')
    
    page.click('button[type="submit"]')

    assert 'Updated Cactus' in page.content()
    
    page.close()

def test_delete_plant(browser):
    page = browser.new_page()
    login(page)

    dialog = None
    page.on("dialog", lambda d: d.accept()) 
    
    page.click('button:has-text("Delete")')
    page.reload()
    while page.url != 'http://localhost:8080/plants':
        page.click("a[href='/plants']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/plants')
    assert 'Cactus' not in page.content()
    page.close()
