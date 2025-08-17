<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_basic_api(): void
    {
        // Register
        $register = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ])->assertOk();
        $token = $register->json('token');
        $this->assertNotEmpty($token);

        // Login
        $login = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ])->assertOk();
        $authToken = $login->json('token');
        $this->assertNotEmpty($authToken);

        // Authenticated products listing
        $this->withHeader('Authorization', 'Bearer '.$authToken)
            ->getJson('/api/products')
            ->assertOk();

        // Place an order (needs at least 1 product from seeder)
        $this->artisan('db:seed');
        $productId = \App\Models\Product::first()->id;
        $this->withHeader('Authorization', 'Bearer '.$authToken)
            ->postJson('/api/orders', [
                'customer_name' => 'Tester',
                'items' => [[ 'product_id' => $productId, 'quantity' => 1 ]],
            ])->assertOk();

        // Reports
        $this->withHeader('Authorization', 'Bearer '.$authToken)
            ->getJson('/api/reports/overview')
            ->assertOk();
    }
}