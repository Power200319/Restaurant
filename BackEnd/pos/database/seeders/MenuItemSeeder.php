<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 🧹 Disable foreign key checks (optional, but helpful if related tables exist)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 🗑️ Clear old data before inserting new data
        MenuItem::truncate();

        // ✅ Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 📦 New menu items to insert
        $menuItems = [
            // 🥗 Papaya Salad
            [
                'name' => 'បុកល្ហុងក្តាមប្រៃ',
                'price' => 3.00,
                'category' => 'ប្រភេទបុកល្ហុង / Papaya Salad',
                'image' => 'http://localhost:8000/images/menu/បុកល្ហុង.png'
            ],
            [
                'name' => 'បុកល្ហុងឆុតពិសេស',
                'price' => 5.00,
                'category' => 'ប្រភេទបុកល្ហុង / Papaya Salad',
                'image' => 'http://localhost:8000/images/menu/បុកល្ហុងឆុតពិសេស.png'
            ],

            // 🌽 Corn Salad
            [
                'name' => 'បុកពោតក្តាមប្រៃ',
                'price' => 3.00,
                'category' => 'ប្រភេទបុកពោត / Corn Salad',
                'image' => 'http://localhost:8000/images/menu/បុកពោតក្តាមប្រៃ.png'
            ],
            [
                'name' => 'បុកពោតគ្រឿងសមុទ្រ',
                'price' => 3.00,
                'category' => 'ប្រភេទបុកពោត / Corn Salad',
                'image' => 'http://localhost:8000/images/menu/បុកពោតគ្រឿងសាមុទ្រ.png'
            ],

            // 🍜 Glass Noodle Salad
            [
                'name' => 'ញុំមីសួរគ្រឿងសមុទ្រ',
                'price' => 3.0,
                'category' => 'ប្រភេទញាំមីសួរ / Glass Noodle Salad',
                'image' => 'http://localhost:8000/images/menu/ញុំមីសួរគ្រឿងសមុទ្រ.png'
            ],
            [
                'name' => 'ញុំមីសួរបន្លែរ',
                'price' => 3.00,
                'category' => 'ប្រភេទញាំមីសួរ / Glass Noodle Salad',
                'image' => 'http://localhost:8000/images/menu/ញុំមីសួរបន្លែរ.png'
            ],

            // 🧂 Add-Ons
            [
                'name' => 'ឆាបន្លែរគ្រប់មុខ',
                'price' => 2.50,
                'category' => 'គ្រឿងបន្ថែម / Add-Ons',
                'image' => 'http://localhost:8000/images/menu/ឆាបន្លែរគ្រប់មុខ.png'
            ],
            [
                'name' => 'ឆាត្រួយល្ពៅ',
                'price' => 2.50,
                'category' => 'គ្រឿងបន្ថែម / Add-Ons',
                'image' => 'http://localhost:8000/images/menu/ឆាត្រួយល្ពៅ.png'
            ],

            // 🍖 Grilled
            [
                'name' => 'ខ្យងអាំងទឹកខ្ទិះ',
                'price' => 2.50,
                'category' => 'ប្រភេទគ្រឿងអាំង / Grilled',
                'image' => 'http://localhost:8000/images/menu/ខ្យងអាំងទឹកខ្ទិះ.png'
            ],
            [
                'name' => 'បង្គាអាំងអំបិលម្ទេស',
                'price' => 3.50,
                'category' => 'ប្រភេទគ្រឿងអាំង / Grilled',
                'image' => 'http://localhost:8000/images/menu/បង្គាអាំងអំបិលម្ទេស.png'
            ],

            // 🍲 Soups
            [
                'name' => 'សម្លគ្រាក់ពោះគោ',
                'price' => 2.50,
                'category' => 'ប្រភេទសម្ល / Soups',
                'image' => 'http://localhost:8000/images/menu/សម្លគ្រាក់ពោះគោ.png'
            ],
            [
                'name' => 'សម្លតុងយាំ',
                'price' => 2.50,
                'category' => 'ប្រភេទសម្ល / Soups',
                'image' => 'http://localhost:8000/images/menu/សម្លតុងយាំ.png'
            ],

            // 🥥 Beverages
            [
                'name' => 'Espresso',
                'price' => 3.00,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/Espresso.png'
            ],
            [
                'name' => 'IcedAmericano',
                'price' => 2.50,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/IcedAmericano.png'
            ],

            // Additional Papaya Salads
            [
                'name' => 'បុកល្ហុងត្រីក្តាមសេះ',
                'price' => 3.50,
                'category' => 'ប្រភេទបុកល្ហុង / Papaya Salad',
                'image' => 'http://localhost:8000/images/menu/បុកល្ហុងត្រីក្តាមសេះ.png'
            ],
            [
                'name' => 'បុកល្ហុងត្រីសាម៊ុណ',
                'price' => 3.00,
                'category' => 'ប្រភេទបុកល្ហុង / Papaya Salad',
                'image' => 'http://localhost:8000/images/menu/បុកល្ហុងត្រីសាម៊ុណ.png'
            ],
            [
                'name' => 'បុកល្ហុងធម្មតា',
                'price' => 3.50,
                'category' => 'ប្រភេទបុកល្ហុង / Papaya Salad',
                'image' => 'http://localhost:8000/images/menu/បុកល្ហុងធម្មតា.png'
            ],

            // Additional Corn Salads
            [
                'name' => 'បុកពោតប្រហិត',
                'price' => 3.50,
                'category' => 'ប្រភេទបុកពោត / Corn Salad',
                'image' => 'http://localhost:8000/images/menu/បុកពោតប្រហិត.png'
            ],
            [
                'name' => 'បុកពោតពងទាប្រៃ',
                'price' => 3.00,
                'category' => 'ប្រភេទបុកពោត / Corn Salad',
                'image' => 'http://localhost:8000/images/menu/បុកពោតពងទាប្រៃ.png'
            ],

            // Additional Glass Noodle Salads
            [
                'name' => 'ញុំមីសួរសាច់ជ្រួក',
                'price' => 3.25,
                'category' => 'ប្រភេទញាំមីសួរ / Glass Noodle Salad',
                'image' => 'http://localhost:8000/images/menu/ញុំមីសួរសាច់ជ្រូក.png'
            ],
            [
                'name' => 'ញុំមីសួរសាច់ប៉ាតេ',
                'price' => 3.75,
                'category' => 'ប្រភេទញាំមីសួរ / Glass Noodle Salad',
                'image' => 'http://localhost:8000/images/menu/ញុំមីសួរសាច់ប៉ាតេ.png'
            ],

            // Additional Add-Ons
            [
                'name' => 'ឆាដើមខាត់ណាសាច់គោ',
                'price' => 2.50,
                'category' => 'គ្រឿងបន្ថែម / Add-Ons',
                'image' => 'http://localhost:8000/images/menu/ឆាដើមខាត់ណាសាច់គោ.png'
            ],
            [
                'name' => 'ឆាត្រកួនប្រេងខ្យង',
                'price' => 2.50,
                'category' => 'គ្រឿងបន្ថែម / Add-Ons',
                'image' => 'http://localhost:8000/images/menu/ឆាត្រកួនប្រេងខ្យង.png'
            ],

            // Additional Grilled
            [
                'name' => 'សាច់គោអាំងទឹកប្រហុក',
                'price' => 3.50,
                'category' => 'ប្រភេទគ្រឿងអាំង / Grilled',
                'image' => 'http://localhost:8000/images/menu/សាច់គោអាំងទឹកប្រហុក.png'
            ],
            [
                'name' => 'ហ៊ុនជ្រូកអាំង',
                'price' => 3.50,
                'category' => 'ប្រភេទគ្រឿងអាំង / Grilled',
                'image' => 'http://localhost:8000/images/menu/ហ៊ុនជ្រូកអាំង.png'
            ],

            // Additional Soups
            [
                'name' => 'សម្លប្រហើរទំពាំង',
                'price' => 2.50,
                'category' => 'ប្រភេទសម្ល / Soups',
                'image' => 'http://localhost:8000/images/menu/សម្លប្រហើរទំពាំង.png'
            ],
            [
                'name' => 'សម្លម្ជូរយួនត្រីរស',
                'price' => 2.50,
                'category' => 'ប្រភេទសម្ល / Soups',
                'image' => 'http://localhost:8000/images/menu/សម្លម្ជូរយួនត្រីរស.png'
            ],

            // Additional Beverages
            [
                'name' => 'HotBlackCoffe',
                'price' => 2.25,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/HotBlackCoffe.png'
            ],
            [
                'name' => 'OrangeJuice',
                'price' => 3.25,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/OrangeJuice.png'
            ],
            [
                'name' => 'Icegreentea',
                'price' => 2.00,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/Icegreentea.png'
            ],
            [
                'name' => 'Passionfuice',
                'price' => 2.00,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/Passionfuice.png'
            ],
            [
                'name' => 'Pineapplejuice',
                'price' => 2.50,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/Pineapplejuice.png'
            ],
            [
                'name' => 'Icedlatte',
                'price' => 3.00,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/Icedlatte.png'
            ],
            [
                'name' => 'HotCappuccino',
                'price' => 3.50,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/HotCappuccino.png'
            ],
            [
                'name' => 'IceLemonadetea',
                'price' => 3.75,
                'category' => 'ភេសជ្ជៈ / Beverages',
                'image' => 'http://localhost:8000/images/menu/IceLemonadetea.png'
            ],
        ];

        // 🔁 Insert each menu item into the database
        foreach ($menuItems as $item) {
            MenuItem::create($item);
        }
    }
}
