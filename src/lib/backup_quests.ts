import type { Quest } from '@/ai/flows/generate-coding-quests';

export const backupQuests: Record<string, Quest[]> = {
    'Apprentice': [
        {
            title: "The Potion Mixer's Dilemma",
            difficulty: "Apprentice",
            mission_briefing: "The local alchemist, Elara, has a list of ingredients represented by their acidic values (integers). She needs to find two ingredients that sum up exactly to the desired potency of her Philosopher's Stone brew. Given an array of ingredient values and a target potency, return the indices of the two ingredients. The guild needs this fast before the mixture explodes!",
            starter_code: "std::vector<int> findIngredientIndices(const std::vector<int>& ingredients, int target) {\n    // Your alchemy logic here\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n#include <algorithm>\n// Hidden Solution Check\nstd::vector<int> solution(const std::vector<int>& nums, int target);\n\nint main() {\n    std::vector<int> ingredients = {2, 7, 11, 15};\n    std::vector<int> result = findIngredientIndices(ingredients, 9);\n    // Expecting indices [0, 1] or [1, 0]\n    bool correct = (result.size() == 2) && \n                   ((result[0] == 0 && result[1] == 1) || (result[0] == 1 && result[1] == 0));\n    assert(correct);\n    return 0;\n}"
            ],
            gold_reward: 100,
            xp_reward: 150,
            language_alias: "cpp"
        },
        {
            title: "The Goblin's Password",
            difficulty: "Apprentice",
            mission_briefing: "A goblin gatekeeper demands a password which is a palindrome of the clan's name. However, he only accepts it if the name itself is already a palindrome. Write a function that checks if a given string is a palindrome. Return true if it is, false otherwise. Case sensitivity matters not to goblins, but let's assume lowercase for now.",
            starter_code: "bool isPalindrome(std::string s) {\n    // Check if s reads the same backwards\n}",
            test_cases: [
                "#include <cassert>\n#include <string>\n\nint main() {\n    assert(isPalindrome(\"racecar\") == true);\n    assert(isPalindrome(\"goblin\") == false);\n    assert(isPalindrome(\"level\") == true);\n    return 0;\n}"
            ],
            gold_reward: 80,
            xp_reward: 120,
            language_alias: "cpp"
        },
        {
            title: "Sort the Loot",
            difficulty: "Apprentice",
            mission_briefing: "The party has returned with a bag of gems, represented by an unsorted array of values. The Treasurer demands they be sorted in ascending order to properly value the haul. Implement a function to sort the vector of integers.",
            starter_code: "void sortLoot(std::vector<int>& loot) {\n    // Sort the loot vector\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> loot = {5, 2, 9, 1, 5, 6};\n    sortLoot(loot);\n    assert(std::is_sorted(loot.begin(), loot.end()));\n    return 0;\n}"
            ],
            gold_reward: 90,
            xp_reward: 130,
            language_alias: "cpp"
        },
        {
            title: "The Stamina Potion",
            difficulty: "Apprentice",
            mission_briefing: "You are brewing a stamina potion. The recipe calls for the factorial of a specific magical number 'n'. Calculate n! (n factorial) recursively or iteratively. Be warned, for 'n' greater than 12, the power might overflow a standard integer!",
            starter_code: "long long factorial(int n) {\n    // Calculate n!\n}",
            test_cases: [
                "#include <cassert>\n\nint main() {\n    assert(factorial(5) == 120);\n    assert(factorial(0) == 1);\n    assert(factorial(3) == 6);\n    return 0;\n}"
            ],
            gold_reward: 110,
            xp_reward: 160,
            language_alias: "cpp"
        }
    ],
    'Master': [
        {
            title: "The Labyrinth's Shortest Path",
            difficulty: "Master",
            mission_briefing: "You are trapped in a grid-based labyrinth represented by a 2D array (0 is path, 1 is wall). Find the length of the shortest path from top-left (0,0) to bottom-right (N-1, M-1). You can move up, down, left, right. Return -1 if no path exists.",
            starter_code: "int shortestPath(const std::vector<std::vector<int>>& grid) {\n    // BFS to find shortest path\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n\nint main() {\n    std::vector<std::vector<int>> grid = {\n        {0, 0, 0},\n        {1, 1, 0},\n        {0, 0, 0}\n    };\n    // Path: (0,0)->(0,1)->(0,2)->(1,2)->(2,2) length is 5 steps if counting cells, or logic distance.\n    // Classic BFS usually counts edges or nodes. Let's assume nodes visited.\n    // Ideally we provide a strict spec. Let's check for > 0.\n    int result = shortestPath(grid);\n    assert(result == 5);\n    return 0;\n}"
            ],
            gold_reward: 250,
            xp_reward: 400,
            language_alias: "cpp"
        },
        {
            title: "The Knapsack of Holding",
            difficulty: "Master",
            mission_briefing: "You have a Bag of Holding with a weight limit 'W'. There are 'n' items, each with a weight and a value. Determine the maximum value you can carry in the bag. This is the classic 0/1 Knapsack problem.",
            starter_code: "int knapsack(int W, const std::vector<int>& wt, const std::vector<int>& val) {\n    // Maximize value within weight W\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n\nint main() {\n    std::vector<int> val = {60, 100, 120};\n    std::vector<int> wt = {10, 20, 30};\n    int W = 50;\n    assert(knapsack(W, wt, val) == 220);\n    return 0;\n}"
            ],
            gold_reward: 300,
            xp_reward: 450,
            language_alias: "cpp"
        },
        {
            title: "The Balanced Parentheses Spell",
            difficulty: "Master",
            mission_briefing: "An ancient spell script uses nested parentheses '(', ')', '{', '}', '[', ']'. A spell is valid only if the parentheses are balanced. Write a function to verify the validity of the spell string.",
            starter_code: "bool isValidSpell(std::string s) {\n    // Check if parentheses are balanced\n}",
            test_cases: [
                "#include <cassert>\n#include <string>\n\nint main() {\n    assert(isValidSpell(\"()[]{}\") == true);\n    assert(isValidSpell(\"(]\") == false);\n    assert(isValidSpell(\"([)]\") == false);\n    assert(isValidSpell(\"{[]}\") == true);\n    return 0;\n}"
            ],
            gold_reward: 200,
            xp_reward: 350,
            language_alias: "cpp"
        },
        {
            title: "The Island Counter",
            difficulty: "Master",
            mission_briefing: "The map of the archipelago is a 2D grid of '1's (land) and '0's (water). An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. Count the number of islands.",
            starter_code: "int numIslands(std::vector<std::vector<char>>& grid) {\n    // Count distinct islands\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n\nint main() {\n    std::vector<std::vector<char>> grid = {\n        {'1','1','1','1','0'},\n        {'1','1','0','1','0'},\n        {'1','1','0','0','0'},\n        {'0','0','0','0','0'}\n    };\n    assert(numIslands(grid) == 1);\n    \n    std::vector<std::vector<char>> grid2 = {\n        {'1','1','0','0','0'},\n        {'1','1','0','0','0'},\n        {'0','0','1','0','0'},\n        {'0','0','0','1','1'}\n    };\n    assert(numIslands(grid2) == 3);\n    return 0;\n}"
            ],
            gold_reward: 280,
            xp_reward: 420,
            language_alias: "cpp"
        }
    ],
    'Legendary': [
        {
            title: "The N-Queens Defence",
            difficulty: "Legendary",
            mission_briefing: "The Queen demands a formation where 'N' queens can be placed on an NxN chessboard such that no two queens attack each other. Return the number of distinct solutions for a given N.",
            starter_code: "int totalNQueens(int n) {\n    // Return count of distinct solutions\n}",
            test_cases: [
                "#include <cassert>\n\nint main() {\n    assert(totalNQueens(4) == 2);\n    assert(totalNQueens(1) == 1);\n    return 0;\n}"
            ],
            gold_reward: 500,
            xp_reward: 800,
            language_alias: "cpp"
        },
        {
            title: "The Median of Two Realms",
            difficulty: "Legendary",
            mission_briefing: "Two sorted arrays represent the power levels of warriors from two different realms. Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)). This is a test of true optimization.",
            starter_code: "double findMedianSortedArrays(const std::vector<int>& nums1, const std::vector<int>& nums2) {\n    // O(log(m+n)) solution\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n#include <cmath>\n\nint main() {\n    std::vector<int> n1 = {1, 3};\n    std::vector<int> n2 = {2};\n    assert(std::abs(findMedianSortedArrays(n1, n2) - 2.0) < 0.0001);\n    \n    std::vector<int> n3 = {1, 2};\n    std::vector<int> n4 = {3, 4};\n    assert(std::abs(findMedianSortedArrays(n3, n4) - 2.5) < 0.0001);\n    return 0;\n}"
            ],
            gold_reward: 600,
            xp_reward: 900,
            language_alias: "cpp"
        },
        {
            title: "The Dragon's Edit Distance",
            difficulty: "Legendary",
            mission_briefing: "To communicate with the ancient dragon, you must transform word1 into word2. You are permitted three operations: Insert, Delete, or Replace a character. Find the minimum number of operations required (The Edit Distance).",
            starter_code: "int minDistance(std::string word1, std::string word2) {\n    // Calculate Levenshtein distance\n}",
            test_cases: [
                "#include <cassert>\n#include <string>\n\nint main() {\n    assert(minDistance(\"horse\", \"ros\") == 3);\n    assert(minDistance(\"intention\", \"execution\") == 5);\n    return 0;\n}"
            ],
            gold_reward: 550,
            xp_reward: 850,
            language_alias: "cpp"
        },
        {
            title: "The Trapped Rain Water",
            difficulty: "Legendary",
            mission_briefing: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. The gods demand efficiency.",
            starter_code: "int trap(const std::vector<int>& height) {\n    // Calculate total trapped water\n}",
            test_cases: [
                "#include <cassert>\n#include <vector>\n\nint main() {\n    std::vector<int> h = {0,1,0,2,1,0,1,3,2,1,2,1};\n    assert(trap(h) == 6);\n    return 0;\n}"
            ],
            gold_reward: 580,
            xp_reward: 880,
            language_alias: "cpp"
        }
    ]
};
