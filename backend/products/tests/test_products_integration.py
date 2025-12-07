import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from unittest.mock import patch
from products.models import Product
from authentication.models import CustomUser
from django.utils import timezone

pytestmark = pytest.mark.django_db


# ------------------------------------------------------
# Fixtures
# ------------------------------------------------------

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def seller(db):
    return CustomUser.objects.create_user(
        email="seller@test.com",
        password="password123",
        role="seller"
    )


@pytest.fixture
def normal_user(db):
    return CustomUser.objects.create_user(
        email="user@test.com",
        password="password123",
        role="buyer"
    )


@pytest.fixture
def product_payload():
    return {
        "name": "Test Product",
        "description": "Great product",
        "price": "25.50",
        "category": "plants",
        "image_urls": [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg"
        ]
    }


# ------------------------------------------------------
# CREATE
# ------------------------------------------------------

def test_seller_can_create_product(client, seller, product_payload):
    client.force_authenticate(user=seller)

    url = reverse("product-list")
    response = client.post(url, product_payload, format="json")

    assert response.status_code == 201
    assert Product.objects.count() == 1
    assert Product.objects.first().owner == seller


def test_non_seller_cannot_create_product(client, normal_user, product_payload):
    client.force_authenticate(user=normal_user)

    url = reverse("product-list")
    response = client.post(url, product_payload, format="json")

    assert response.status_code == 403


# ------------------------------------------------------
# LIST + FILTER
# ------------------------------------------------------

def test_list_products(client, seller):
    Product.objects.create(
        name="Plant Item",
        description="Plant",
        price="10.00",
        category="plants",
        owner=seller
    )

    Product.objects.create(
        name="Tool Item",
        description="Tool",
        price="20.00",
        category="tools",
        owner=seller
    )

    url = reverse("product-list")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_products_by_category(client, seller):
    Product.objects.create(
        name="Fertilizer",
        description="desc",
        price="10.00",
        category="fertilizers",
        owner=seller
    )

    url = reverse("product-list") + "?category=fertilizers"
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 1


# ------------------------------------------------------
# RETRIEVE
# ------------------------------------------------------

def test_retrieve_product(client, seller):
    product = Product.objects.create(
        name="Single Item",
        description="desc",
        price="15.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    response = client.get(url)

    assert response.status_code == 200
    assert response.json()["name"] == "Single Item"


# ------------------------------------------------------
# UPDATE
# ------------------------------------------------------

def test_seller_can_update_own_product(client, seller):
    client.force_authenticate(user=seller)

    product = Product.objects.create(
        name="Old Name",
        description="Old desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    payload = {
        "name": "New Name",
        "description": "Updated desc",
        "price": "50.00",
        "category": "plants"
    }

    response = client.put(url, payload, format="json")

    assert response.status_code == 200
    product.refresh_from_db()
    assert product.name == "New Name"


# ------------------------------------------------------
# DELETE
# ------------------------------------------------------

def test_seller_can_delete_own_product(client, seller):
    client.force_authenticate(user=seller)

    product = Product.objects.create(
        name="Delete Me",
        description="desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    response = client.delete(url)

    assert response.status_code == 204
    assert Product.objects.count() == 0


# ------------------------------------------------------
# CUSTOM ACTION: my_products
# ------------------------------------------------------

def test_my_products_endpoint(client, seller):
    client.force_authenticate(user=seller)

    Product.objects.create(
        name="Mine",
        description="desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-my-products")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 1

