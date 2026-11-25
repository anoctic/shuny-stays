import { DayOfWeek, MealType, UserRole } from "@/types/schema.types";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MealSlot {
  mealType: MealType;
  title: string;
  titleHindi: string;
  time: string;
  items: string;
  isSpecial?: boolean;
}

export interface DayMenuPlan {
  dayOfWeek: DayOfWeek;
  dayLabel: string;
  dayLabelHindi: string;
  shortDay: string;
  isToday: boolean;
  meals: Record<MealType, MealSlot>;
}

export interface WeeklyMessMenu {
  pgId?: string;
  days: DayMenuPlan[];
  daysMap: Record<DayOfWeek, DayMenuPlan>;
  today: DayMenuPlan;
  currentDay: DayOfWeek;
  currentActiveMealType: MealType;
  formattedDateIST: string;
}

export const DAYS_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_METADATA: Record<
  DayOfWeek,
  { label: string; labelHindi: string; short: string }
> = {
  monday: { label: "Monday", labelHindi: "Somwar", short: "Mon" },
  tuesday: { label: "Tuesday", labelHindi: "Mangalwar", short: "Tue" },
  wednesday: { label: "Wednesday", labelHindi: "Budhwar", short: "Wed" },
  thursday: { label: "Thursday", labelHindi: "Guruwar", short: "Thu" },
  friday: { label: "Friday", labelHindi: "Shukrawar", short: "Fri" },
  saturday: { label: "Saturday", labelHindi: "Shaniwar", short: "Sat" },
  sunday: { label: "Sunday", labelHindi: "Ravivar", short: "Sun" },
};

/**
 * Authentic, chef-curated 7-day Indian PG Mess Menu timetable
 */
export const DEFAULT_WEEKLY_MENU: Record<
  DayOfWeek,
  Record<MealType, { title: string; titleHindi: string; time: string; items: string; isSpecial: boolean }>
> = {
  monday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Aloo Pyaaz Paratha with Amul Butter, Dahi, Lemon Pickle & Adrak Masala Chai",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Rajma Masala (Punjabi Style), Steamed Jeera Rice, Tawa Phulka Roti, Boondi Raita & Onion Salad",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Crispy Poha with Sev & Roasted Peanuts, Green Chutney & Hot Masala Tea",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Aloo Gobhi Masala, Dal Tadka, Steamed Basmati Rice, Butter Phulka & Hot Gulab Jamun",
      isSpecial: false,
    },
  },
  tuesday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Steaming Soft Idli & Crispy Medu Vada, Coconut Chutney, Hot Veg Sambar & Filter Coffee",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Punjabi Kadhi Pakoda, Steamed Rice, Aloo Jeera Fry, Methi Roti & Mixed Green Salad",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Crispy Vegetable Cutlet / Hot Maggi, Mint-Coriander Sauce & Cutting Chai",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Paneer Do Pyaza, Yellow Moong Dal Fry, Steamed Basmati Rice, Soft Tawa Roti & Dahi",
      isSpecial: false,
    },
  },
  wednesday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Halwai Style Poori with Tari-wali Aloo Bhaji, Sooji Halwa & Masala Chai",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Delhi Style Chole Masala, Butter Tawa Roti, Fragrant Jeera Pulao, Sirka Pyaaz & Fresh Curd",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Grilled Vegetable Club Sandwich with Tomato Ketchup & Hot Filter Coffee",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Palak Paneer (or Egg Curry option), Dal Fry, Steamed Rice, Butter Phulka & Chilled Kheer",
      isSpecial: true,
    },
  },
  thursday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Crispy Masala Dosa with Potato Filling, Sambar, Roasted Tomato & Coconut Chutney",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Matar Paneer / Soya Chaap Curry, Dal Makhani, Steamed Basmati Rice, Phulka Roti & Salad",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Crispy Aloo Samosa (2 Pcs) with Sweet Imli Saunth & Spicy Green Chutney, Masala Chai",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Kashmiri Dum Aloo, Panchmel Dal, Jeera Rice, Soft Tawa Roti & Fruit Custard",
      isSpecial: false,
    },
  },
  friday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Spiced Methi Thepla & Gobhi Paratha, White Makhan, Mango Pickle & Adrak Chai",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Chana Dal Tadka, Aloo Shimla Mirch, Veg Pulao, Tawa Roti, Roasted Papad & Boondi Raita",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Paneer Bread Pakoda / Veg Spring Roll with Tangy Chutney & Chai",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Royal Shahi Paneer, Dhaba Dal Fry, Desi Ghee Rice, Butter Roti & Soft Rasgulla",
      isSpecial: true,
    },
  },
  saturday: {
    breakfast: {
      title: "Breakfast",
      titleHindi: "Nashta",
      time: "07:30 AM - 09:30 AM",
      items: "Rava Veg Upma & Vermicelli Poha with Coconut Chutney, Fresh Banana & Masala Chai",
      isSpecial: false,
    },
    lunch: {
      title: "Lunch",
      titleHindi: "Dopahar Ka Khana",
      time: "12:30 PM - 02:30 PM",
      items: "Khichdi Mahotsav / Sambar Rice with Desi Ghee, Crispy Papad, Baingan Bhaja & Dahi",
      isSpecial: false,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:15 PM",
      items: "Mumbai Pav Bhaji with Butter Toasted Pav, Chopped Onions, Lemon & Masala Chai",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Hyderabadi Veg Dum Biryani with Mirchi Ka Salan, Onion Raita, Dal Tadka, Roti & Ice Cream",
      isSpecial: true,
    },
  },
  sunday: {
    breakfast: {
      title: "Breakfast (Special Brunch)",
      titleHindi: "Sunday Special Brunch",
      time: "08:00 AM - 10:30 AM",
      items: "Delhi Wale Chole Bhature with Pickled Green Chillies, Sweet Lassi & Masala Chai",
      isSpecial: true,
    },
    lunch: {
      title: "Lunch (Sunday Royal Feast)",
      titleHindi: "Sunday Royal Feast",
      time: "12:30 PM - 03:00 PM",
      items: "Sunday Royal Thali: Paneer Butter Masala (or Chicken Curry), Dal Makhani, Veg Pulao, Butter Naan, Sweet Gulab Jamun",
      isSpecial: true,
    },
    snacks: {
      title: "Evening Snacks",
      titleHindi: "Chai & Snacks",
      time: "05:00 PM - 06:30 PM",
      items: "Hot Onion Pakoda & French Fries with Green Mint Chutney & Cutting Chai",
      isSpecial: false,
    },
    dinner: {
      title: "Dinner (Light Comfort)",
      titleHindi: "Raat Ka Khana",
      time: "08:00 PM - 10:00 PM",
      items: "Light Comfort Dinner: Moong Dal Khichdi / Egg Bhurji with Roti, Steamed Rice, Papad & Curd",
      isSpecial: false,
    },
  },
};

/**
 * Calculates current Day of Week and currently Active Meal Type in IST (Asia/Kolkata)
 */
export function getCurrentISTDayAndMeal(): {
  currentDay: DayOfWeek;
  currentActiveMealType: MealType;
  formattedDateIST: string;
} {
  const now = new Date();

  // Day of week in IST
  const istDayName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  })
    .format(now)
    .toLowerCase() as DayOfWeek;

  const validDay: DayOfWeek = DAYS_ORDER.includes(istDayName)
    ? istDayName
    : "wednesday";

  // Formatted date string in IST
  const formattedDateIST = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
  }).format(now);

  // Current hour in IST
  const istHourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(istHourStr, 10);

  // Active meal determination
  let currentActiveMealType: MealType = "lunch";
  if (hour >= 6 && hour < 11) {
    currentActiveMealType = "breakfast";
  } else if (hour >= 11 && hour < 16) {
    currentActiveMealType = "lunch";
  } else if (hour >= 16 && hour < 19) {
    currentActiveMealType = "snacks";
  } else {
    currentActiveMealType = "dinner";
  }

  return {
    currentDay: validDay,
    currentActiveMealType,
    formattedDateIST,
  };
}

/**
 * Fetch full 7-day Weekly Mess Menu merged with Supabase records
 */
export async function getWeeklyMessMenu(pgId?: string): Promise<WeeklyMessMenu> {
  const { currentDay, currentActiveMealType, formattedDateIST } = getCurrentISTDayAndMeal();

  let dbItems: any[] = [];
  try {
    const admin = createAdminClient();
    let query = (admin.from("mess_menu" as any) as any).select("*");
    if (pgId) {
      query = query.or(`pg_id.eq.${pgId},pg_id.is.null`);
    }
    const { data } = await query;
    if (data && data.length > 0) {
      dbItems = data;
    }
  } catch (err) {
    console.warn("getWeeklyMessMenu database query:", err);
  }

  // Construct each day's plan
  const daysMap: Partial<Record<DayOfWeek, DayMenuPlan>> = {};

  DAYS_ORDER.forEach((dayKey) => {
    const meta = DAY_METADATA[dayKey];
    const defaultDay = DEFAULT_WEEKLY_MENU[dayKey];

    const mealTypes: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];
    const meals: Record<MealType, MealSlot> = {} as any;

    mealTypes.forEach((mType) => {
      const def = defaultDay[mType];
      // Check if DB has an override for this day and meal
      const dbMatch = dbItems.find(
        (d: any) =>
          d.day_of_week?.toLowerCase() === dayKey &&
          d.meal_type?.toLowerCase() === mType &&
          (!pgId || d.pg_id === pgId || !d.pg_id)
      );

      meals[mType] = {
        mealType: mType,
        title: def.title,
        titleHindi: def.titleHindi,
        time: dbMatch?.start_time && dbMatch?.end_time
          ? `${dbMatch.start_time.slice(0, 5)} - ${dbMatch.end_time.slice(0, 5)}`
          : def.time,
        items: dbMatch?.menu_items || def.items,
        isSpecial: dbMatch?.is_special !== undefined ? Boolean(dbMatch.is_special) : def.isSpecial,
      };
    });

    daysMap[dayKey] = {
      dayOfWeek: dayKey,
      dayLabel: meta.label,
      dayLabelHindi: meta.labelHindi,
      shortDay: meta.short,
      isToday: dayKey === currentDay,
      meals,
    };
  });

  const daysList = DAYS_ORDER.map((d) => daysMap[d] as DayMenuPlan);
  const todayPlan = daysMap[currentDay] as DayMenuPlan;

  return {
    pgId,
    days: daysList,
    daysMap: daysMap as Record<DayOfWeek, DayMenuPlan>,
    today: todayPlan,
    currentDay,
    currentActiveMealType,
    formattedDateIST,
  };
}

/**
 * Update a specific meal on a specific day in Supabase
 */
export async function updateMealMenuItem(params: {
  pgId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  menuItems: string;
  isSpecial?: boolean;
  startTime?: string;
  endTime?: string;
}) {
  const admin = createAdminClient();

  // Try to find existing record
  const { data: existing } = await (admin.from("mess_menu" as any) as any)
    .select("id")
    .eq("pg_id", params.pgId)
    .eq("day_of_week", params.dayOfWeek)
    .eq("meal_type", params.mealType)
    .maybeSingle();

  const recordId = existing?.id || crypto.randomUUID();

  const { error } = await (admin.from("mess_menu" as any) as any).upsert({
    id: recordId,
    pg_id: params.pgId,
    day_of_week: params.dayOfWeek,
    meal_type: params.mealType,
    menu_items: params.menuItems.trim(),
    is_special: Boolean(params.isSpecial),
    start_time: params.startTime || null,
    end_time: params.endTime || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("updateMealMenuItem error:", error);
    throw new Error(`Failed to update menu: ${error.message}`);
  }

  return { success: true };
}

/**
 * Seed all 28 default weekly meal slots for a PG
 */
export async function seedDefaultWeeklyMenu(pgId: string) {
  const admin = createAdminClient();
  const records: any[] = [];

  DAYS_ORDER.forEach((dayKey) => {
    const dayData = DEFAULT_WEEKLY_MENU[dayKey];
    (["breakfast", "lunch", "snacks", "dinner"] as MealType[]).forEach((mType) => {
      const slot = dayData[mType];
      records.push({
        id: crypto.randomUUID(),
        pg_id: pgId,
        day_of_week: dayKey,
        meal_type: mType,
        menu_items: slot.items,
        is_special: slot.isSpecial,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  });

  // Delete existing records for this PG first to avoid clutter
  try {
    await (admin.from("mess_menu" as any) as any).delete().eq("pg_id", pgId);
  } catch {}

  const { error } = await (admin.from("mess_menu" as any) as any).insert(records);
  if (error) {
    console.error("seedDefaultWeeklyMenu error:", error);
    throw new Error(`Failed to seed weekly menu: ${error.message}`);
  }

  return { success: true, count: records.length };
}
