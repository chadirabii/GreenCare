import pytest
from playwright.sync_api import sync_playwright
import os
#account for testing seller
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
    while page.url != 'http://localhost:8080/my-products':
        page.click('span:has-text("Marketplace")')
        page.click("a[href='/my-products']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/my-products')
def login2(page):
    page.goto('http://localhost:8080/auth')
    page.fill('input[type="email"]', USERNAME)
    page.fill('input[type="password"]', PASSWORD)
    page.click('button[type="submit"]')
    while page.url != 'http://localhost:8080/products':
        page.click('span:has-text("Marketplace")')
        page.click("a[href='/products']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/products')
def test_add_product(browser):
    page = browser.new_page()
    login(page)
    page.click('button:has-text("Add New Product")')
    
    current_working_dir = os.getcwd()
    image_file_path = os.path.join(current_working_dir, "backend\products\\tests\exp.jpg") 

    page.fill('input[name="name"]', 'Test Product')
    page.fill('textarea[name="description"]', 'Test Product Description')
    page.fill('input[name="price"]', '25.99')
    page.select_option('select[name="category"]', index=0)
    page.set_input_files('#images-upload', image_file_path)

    page.locator('img[alt="Preview 1"]').wait_for(state='visible')

    page.click('button[type="submit"]')
    page.wait_for_timeout(2000) 
    assert 'Test Product' in page.content()
    page.close()
def test_search_product(browser):
    page = browser.new_page()
    login2(page)
    
    page.fill('input[placeholder="Search products..."]', 'Test Product')

    assert 'Test Product' in page.content()
    page.close()
def test_edit_product(browser):
    page = browser.new_page()
    login(page)
    
    page.click('button:has-text("Edit")')
    
    page.fill('input[name="name"]', 'Updated Product Name')
    page.fill('textarea[name="description"]', 'Updated Product Description')
    page.fill('input[name="price"]', '30.00')

    page.click('button[type="submit"]')

    assert 'Updated Product Name' in page.content()
    page.close()

def test_view_product_details(browser):
    page = browser.new_page()
    login(page)
    
    page.click('button:has-text("View")')
    
    assert page.url.startswith('http://localhost:8080/products/')
    page.close()

def test_delete_product(browser):
    page = browser.new_page()
    login(page)
    page.click('button:has-text("Delete")')
    page.click('#deleteC')
    page.reload()
    while page.url != 'http://localhost:8080/my-products':
        page.click("a[href='/watering']")
        page.wait_for_timeout(2000)
    page.wait_for_url('http://localhost:8080/my-products')
    assert 'Test Product' not in page.content()
    page.close()

def test_empty_state(browser):
    page = browser.new_page()
    login(page)
    assert 'You haven\'t listed any products yet' in page.content()
    page.close()
