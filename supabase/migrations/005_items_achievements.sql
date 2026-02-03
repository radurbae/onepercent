-- =====================================================
-- 005: Items, Achievements & Effect System
-- =====================================================

-- Items table (master catalog of all items)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('title', 'badge', 'theme', 'artifact')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    description TEXT,
    effect_type TEXT, -- 'xp_boost', 'gold_boost', 'streak_buffer', 'category_xp_boost', 'skip_penalty_reduce'
    effect_value INTEGER, -- percentage or flat value
    effect_category TEXT, -- for category-specific effects (e.g., 'focus', 'learning')
    icon_key TEXT NOT NULL DEFAULT '📦',
    unlock_condition TEXT, -- Human readable unlock condition
    unlock_key TEXT, -- Achievement key that unlocks this item
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User items (ownership + equipped state)
CREATE TABLE IF NOT EXISTS user_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items ON DELETE CASCADE,
    equipped BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, item_id)
);

-- Achievements (unlocked achievement keys per user)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    key TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, key)
);

-- Add equipped_artifact to player_profile
ALTER TABLE player_profile 
ADD COLUMN IF NOT EXISTS equipped_artifact TEXT;

-- =====================================================
-- SEED DATA: Items
-- =====================================================

-- Titles (8)
INSERT INTO items (name, type, rarity, description, effect_type, effect_value, icon_key, unlock_condition, unlock_key) VALUES
('Beginner', 'title', 'common', 'Your journey begins here.', NULL, NULL, '🌱', 'Complete first quest', 'first_quest'),
('The Consistent', 'title', 'rare', 'You show up every day.', 'xp_boost', 5, '🔥', '7-day streak', 'streak_7'),
('Iron Will', 'title', 'epic', 'Focused and determined.', 'category_xp_boost', 10, '💪', 'Complete 20 focus quests', 'focus_20'),
('Scholar', 'title', 'rare', 'Knowledge is power.', 'category_xp_boost', 5, '📚', 'Complete 30 learning quests', 'learning_30'),
('Never Miss Twice', 'title', 'epic', 'Bounce back stronger.', 'skip_penalty_reduce', 50, '🛡️', 'Complete quest after skip', 'comeback'),
('Marathoner', 'title', 'rare', 'In it for the long run.', 'xp_boost', 3, '🏃', 'Complete 50 quests', 'quests_50'),
('Early Bird', 'title', 'common', 'The early bird gets the XP.', NULL, NULL, '🌅', 'Complete 10 morning sessions', 'morning_10'),
('Night Owl', 'title', 'common', 'Burning the midnight oil.', NULL, NULL, '🦉', 'Complete 10 late sessions', 'night_10')
ON CONFLICT (name) DO NOTHING;

-- Badges (10)
INSERT INTO items (name, type, rarity, description, icon_key, unlock_condition, unlock_key) VALUES
('First Blood', 'badge', 'common', 'Your first completed quest.', '⚔️', 'Complete first quest', 'first_quest'),
('7-Day Flame', 'badge', 'rare', 'A week of fire!', '🔥', '7-day streak', 'streak_7'),
('14-Day Flame', 'badge', 'epic', 'Two weeks strong!', '🔥', '14-day streak', 'streak_14'),
('30-Day Flame', 'badge', 'legendary', 'A month of dedication!', '🔥', '30-day streak', 'streak_30'),
('Comeback Kid', 'badge', 'rare', 'Never gave up.', '💫', 'Complete after a skip', 'comeback'),
('Century', 'badge', 'epic', '100 quests completed!', '💯', 'Complete 100 quests', 'quests_100'),
('Perfect Week', 'badge', 'epic', 'Flawless 7 days.', '⭐', 'Complete all quests for 7 days', 'perfect_week'),
('Focus King', 'badge', 'rare', 'Master of focus.', '👑', 'Complete 30 focus quests', 'focus_30'),
('Knowledge Seeker', 'badge', 'rare', 'Always learning.', '🎓', 'Complete 30 learning quests', 'learning_30'),
('No Excuses', 'badge', 'legendary', 'Zero skips in 30 days.', '💎', 'No skips for 30 days', 'no_skip_30')
ON CONFLICT (name) DO NOTHING;

-- Themes (5)
INSERT INTO items (name, type, rarity, description, icon_key, unlock_condition, unlock_key) VALUES
('Default Dark', 'theme', 'common', 'The classic dark theme.', '🌑', 'Available by default', NULL),
('Ocean Blue', 'theme', 'rare', 'Calm and focused.', '🌊', 'Reach Level 5', 'level_5'),
('Forest Green', 'theme', 'rare', 'Connect with nature.', '🌲', 'Complete 20 wellness quests', 'wellness_20'),
('Scholar Mode', 'theme', 'epic', 'For the studious.', '📖', 'Complete 50 learning quests', 'learning_50'),
('Neon Cyber', 'theme', 'legendary', 'Future is now.', '💜', 'Reach Rank A', 'rank_a')
ON CONFLICT (name) DO NOTHING;

-- Artifacts (4)
INSERT INTO items (name, type, rarity, description, effect_type, effect_value, effect_category, icon_key, unlock_condition, unlock_key) VALUES
('Focus Crystal', 'artifact', 'rare', 'Enhances productivity XP.', 'category_xp_boost', 5, 'productivity', '💎', 'Complete 15 focus quests', 'focus_15'),
('Streak Charm', 'artifact', 'epic', 'Protects your streak once.', 'streak_buffer', 1, NULL, '🔮', '14-day streak', 'streak_14'),
('Knowledge Scroll', 'artifact', 'rare', 'Enhances learning XP.', 'category_xp_boost', 5, 'learning', '📜', 'Complete 20 learning quests', 'learning_20'),
('Time Hourglass', 'artifact', 'epic', 'Bonus XP for timed quests.', 'xp_boost', 10, NULL, '⏳', 'Complete 30 quests', 'quests_30')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Items: everyone can read (it's a catalog)
CREATE POLICY "Items are viewable by everyone"
    ON items FOR SELECT
    USING (true);

-- User items: users can only see their own
CREATE POLICY "Users can view own items"
    ON user_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
    ON user_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
    ON user_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Achievements: users can only see their own
CREATE POLICY "Users can view own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
    ON achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_items_user ON user_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_items_equipped ON user_items(user_id, equipped);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_key ON achievements(user_id, key);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_unlock_key ON items(unlock_key);
