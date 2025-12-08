import pytest
from playwright.sync_api import sync_playwright
#account for testing plants owner 
USERNAME = ""
PASSWORD = ""

@pytest.fixture(scope="function")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to False to see the browser
        yield browser
        browser.close()


def login(page):
    page.goto('http://localhost:8080/auth')
    page.fill('input[type="email"]', USERNAME)
    page.fill('input[type="password"]', PASSWORD)
    page.click('button[type="submit"]')
    while page.url != 'http://localhost:8080/watering':
        page.click("a[href='/watering']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/watering')

def test_add_watering(browser):
    page = browser.new_page()    
    login(page)
    page.click('button:has-text("Add Watering")')
 
    page.select_option('select#plant', index=1)  
    page.fill('input#watering_date', '2025-12-10')
    page.fill('input#next_watering_date', '2025-12-20')
    page.fill('input#amount_ml', '500')
    page.fill('input#notes', 'Test watering notes')

    page.click('button[type="submit"]')

    assert 'Test watering notes' in page.content()
    page.close()
def test_search_watering(browser):
    page = browser.new_page()
    login(page)
    page.fill('input[placeholder="Search waterings..."]', 'Test watering notes')

    assert 'Test watering notes' in page.content()
    page.close()
def test_update_watering(browser):
    page = browser.new_page()
    login(page)
    page.locator("#edit").first.click()

    page.fill('input#watering_date', '2025-12-15')
    page.fill('input#notes', 'Updated watering notes')

    page.click('button[type="submit"]')

    assert 'Updated watering notes' in page.content()
    page.close()


def test_delete_watering(browser):
    page = browser.new_page()
    login(page)
    page.locator("#delete").first.click()
    page.reload()
    while page.url != 'http://localhost:8080/watering':
        page.click("a[href='/watering']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/watering')
    assert 'Test watering notes' not in page.content()
    page.close()
