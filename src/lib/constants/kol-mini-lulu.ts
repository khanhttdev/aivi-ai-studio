export const KOL_MINI_LULU_CONSTANTS = {
  CHARACTERS: {
    MINI: {
      id: 'mini',
      name: 'Mini',
      species: 'Cat',
      breed: 'British Shorthair',
      description: 'The Boss. Sassy, intelligent, judgemental.',
      visual_prompt: 'chubby british shorthair cat, silver grey fur, round face, grumpy but cute expression, wearing a red bow tie, sitting elegantly, soft fur details, big yellow eyes',
      voice_style: 'Sassy, childish, high-pitched female',
      image: '/characters/mini-the-critic.png',
    },
    LULU: {
      id: 'lulu',
      name: 'Lulu',
      species: 'Dog',
      breed: 'Golden Retriever',
      description: 'The Sidekick. Clumsy, energetic, happy-go-lucky.',
      visual_prompt: 'golden retriever puppy, golden fluffy fur, happy tongue out expression, wearing a blue bandana, dynamic pose, friendly eyes, wagging tail',
      voice_style: 'Energetic, dopey, childish male',
      image: '/characters/lulu-explorer.jpg',
    }
  },
  STYLE: {
    BASE_PROMPT: '3d disney pixar style, animated movie character, high quality 3d render, unreal engine 5, octane render, cute, fluffy texture, expressive eyes, bright cinematic lighting, soft pastel colors, 8k resolution'
  },

  // Category-specific template banks
  CATEGORY_TEMPLATES: {
    food: [
      {
        id: 'cooking-fail',
        titleKey: 'cooking_fail',
        descKey: 'cooking_fail_desc',
        scenes: [
          { character: 'mini', action: 'wearing chef hat, stirring pot with serious face', dialogue: 'Hôm nay trổ tài làm món Pate thượng hạng!' },
          { character: 'lulu', action: 'running around with a bag of flour, white powder everywhere', dialogue: 'Em phụ chị với! Bột mì nè!' },
          { character: 'mini', action: 'covered in flour, angry expression, holding a spoon', dialogue: 'LULU!!! Ra khỏi bếp NGAY!' },
          { character: 'lulu', action: 'sitting in corner covered in flour, looking guilty but cute', dialogue: 'Em chỉ muốn giúp thôi mà...' }
        ]
      },
      {
        id: 'food-review',
        titleKey: 'food_review',
        descKey: 'food_review_desc',
        scenes: [
          { character: 'mini', action: 'sitting at fancy restaurant table, putting on monocle', dialogue: 'Hôm nay sẽ review nhà hàng 5 sao này!' },
          { character: 'lulu', action: 'drooling at the menu, eyes sparkling', dialogue: 'Cái gì cũng muốn ăn hết!' },
          { character: 'mini', action: 'tasting food with judgmental face, writing notes', dialogue: 'Hmm... vị này chỉ được 7/10. Thiếu muối.' },
          { character: 'both', action: 'fighting over the last piece of cake', dialogue: '(Cùng nhau) Miếng cuối cùng là của tui!' }
        ]
      },
      {
        id: 'mukbang',
        titleKey: 'mukbang',
        descKey: 'mukbang_desc',
        scenes: [
          { character: 'both', action: 'huge table with various dishes, camera setup', dialogue: 'Chào mọi người! Hôm nay ăn sập Sài Gòn!' },
          { character: 'lulu', action: 'eating extremely fast, face covered in sauce', dialogue: 'Ngon quá trời! *chomp chomp*' },
          { character: 'mini', action: 'eating gracefully with napkin, disgusted at Lulu', dialogue: 'Ăn từ tốn đi! Mất hình tượng!' },
          { character: 'lulu', action: 'food coma, lying on back with full belly', dialogue: 'No quá... không thở nổi...' }
        ]
      }
    ],
    home: [
      {
        id: 'home-decor',
        titleKey: 'home_decor',
        descKey: 'home_decor_desc',
        scenes: [
          { character: 'mini', action: 'watching interior design video on laptop', dialogue: 'Nhà mình cần makeover theo phong cách tối giản!' },
          { character: 'lulu', action: 'dragging random objects into living room', dialogue: 'Em có ghế beanbag nè! Và cây cối! Và đèn!' },
          { character: 'mini', action: 'facepalm with paw, looking at messy room', dialogue: 'Tối giản mà em mang cả chợ về...' },
          { character: 'both', action: 'sitting proudly in newly decorated room', dialogue: 'Kết quả cũng... ổn phết!' }
        ]
      },
      {
        id: 'cleaning-day',
        titleKey: 'cleaning_day',
        descKey: 'cleaning_day_desc',
        scenes: [
          { character: 'mini', action: 'wearing cleaning headband, holding spray bottle', dialogue: 'Hôm nay tổng vệ sinh! Lulu dọn phòng đi!' },
          { character: 'lulu', action: 'playing with vacuum cleaner like a toy', dialogue: 'Máy hút bụi vui quá ha!' },
          { character: 'mini', action: 'finding hidden snack stash behind sofa', dialogue: 'Lulu! Đống snack này là sao?!' },
          { character: 'lulu', action: 'guilty face, hiding behind curtain', dialogue: 'Em... cất dự phòng thôi mà...' }
        ]
      }
    ],
    tech: [
      {
        id: 'unboxing',
        titleKey: 'unboxing',
        descKey: 'unboxing_desc',
        scenes: [
          { character: 'mini', action: 'sitting next to a large box, camera setup for unboxing', dialogue: 'Hôm nay unbox iPhone 20 Ultra Max Pro!' },
          { character: 'lulu', action: 'chewing on the box instead of opening it properly', dialogue: 'Để em mở cho! *cắn cắn*' },
          { character: 'mini', action: 'shocked face looking at destroyed packaging', dialogue: 'LULU! Hộp xấu hết rồi!' },
          { character: 'mini', action: 'taking perfect product photo with ring light', dialogue: 'Review camera: 10 điểm. Đẹp hơn mặt Lulu.' }
        ]
      },
      {
        id: 'smart-home',
        titleKey: 'smart_home',
        descKey: 'smart_home_desc',
        scenes: [
          { character: 'mini', action: 'programming smart home with voice commands', dialogue: 'Alexa, bật đèn! OK Google, mở nhạc!' },
          { character: 'lulu', action: 'barking at the smart speaker confused', dialogue: 'Ai nói trong cái hộp! Ra đây!' },
          { character: 'mini', action: 'all devices going haywire, lights flashing', dialogue: 'Lulu! Đừng cắn dây điện!!!' },
          { character: 'both', action: 'sitting in dark room, power outage', dialogue: '... Thôi quay lại dùng nến vậy.' }
        ]
      }
    ],
    finance: [
      {
        id: 'saving-money',
        titleKey: 'saving_money',
        descKey: 'saving_money_desc',
        scenes: [
          { character: 'mini', action: 'wearing glasses, spreadsheet on screen', dialogue: 'Từ nay tiết kiệm! Budget 500k/tuần!' },
          { character: 'lulu', action: 'sneaking to buy treats online', dialogue: 'Bánh xương có sale 50%... mua thôi!' },
          { character: 'mini', action: 'checking bank app with shocked face', dialogue: 'LULU! Hết tiền rồi! Mới ngày thứ 2!' },
          { character: 'lulu', action: 'hiding shopping bags behind back', dialogue: 'Nhưng mà... sale mà... đâu có lãng phí...' }
        ]
      }
    ],
    travel: [
      {
        id: 'first-trip',
        titleKey: 'first_trip',
        descKey: 'first_trip_desc',
        scenes: [
          { character: 'mini', action: 'packing suitcase with organized items', dialogue: 'Đà Lạt! Mang áo ấm, kem chống nắng...' },
          { character: 'lulu', action: 'stuffing entire toy collection into backpack', dialogue: 'Em mang Mr. Bear và Mrs. Duck và...' },
          { character: 'both', action: 'sitting on scooter touring the countryside', dialogue: 'Đẹp quá trời! Chụp ảnh đi!' },
          { character: 'mini', action: 'perfect pose for photo while Lulu photobombs', dialogue: 'LULU! Ra khỏi khung hình!' }
        ]
      }
    ],
    fashion: [
      {
        id: 'ootd',
        titleKey: 'ootd',
        descKey: 'ootd_desc',
        scenes: [
          { character: 'mini', action: 'trying on sunglasses and scarf in mirror', dialogue: 'Hôm nay OOTD style Parisian chic!' },
          { character: 'lulu', action: 'wearing mismatched clothes proudly', dialogue: 'Em cũng thời trang nè! Áo hoa quần sọc!' },
          { character: 'mini', action: 'horrified expression looking at Lulu outfit', dialogue: 'Trời ơi... fashion disaster...' },
          { character: 'both', action: 'walking down street like a runway, mini stylish, lulu goofy', dialogue: '(Narrator) Ai bảo thời trang là phải giống nhau?' }
        ]
      }
    ],
    health: [
      {
        id: 'gym-workout',
        titleKey: 'gym_workout',
        descKey: 'gym_workout_desc',
        scenes: [
          { character: 'mini', action: 'lying on yoga mat, lifting tiny dumbbells, sweating', dialogue: 'Mục tiêu: Giảm 2 lạng mỡ thừa!' },
          { character: 'lulu', action: 'biting the yoga mat and pulling it away', dialogue: 'Chơi kéo co đi chị ơi!' },
          { character: 'mini', action: 'faceplanted on floor, annoyed', dialogue: 'Mất hết cả hứng tập...' },
          { character: 'both', action: 'sleeping together on the yoga mat', dialogue: '(Cùng nhau) Thôi mai tập tiếp...' }
        ]
      }
    ],
    education: [
      {
        id: 'study-tips',
        titleKey: 'study_tips',
        descKey: 'study_tips_desc',
        scenes: [
          { character: 'mini', action: 'wearing reading glasses, surrounded by books', dialogue: 'Bí quyết học giỏi: Tập trung 100%!' },
          { character: 'lulu', action: 'falling asleep on textbook, drooling', dialogue: 'Zzz... 1+1=... zzz...' },
          { character: 'mini', action: 'slapping Lulu with ruler (gently)', dialogue: 'Dậy học! Thi tuần sau rồi!' },
          { character: 'both', action: 'celebrating with A+ test paper', dialogue: 'Chúng ta LÀM ĐƯỢC rồi!!!' }
        ]
      }
    ],
    entertainment: [
      {
        id: 'scary-movie',
        titleKey: 'scary_movie',
        descKey: 'scary_movie_desc',
        scenes: [
          { character: 'both', action: 'sitting in dark room with popcorn, staring at TV screen, scared faces', dialogue: 'Nghe nói phim này ghê lắm...' },
          { character: 'mini', action: 'hiding behind cushion, only eyes visible', dialogue: 'Á! Con gì kìa!' },
          { character: 'lulu', action: 'barking at the TV screen bravely', dialogue: 'Gâu! Đừng sợ, có em bảo vệ!' },
          { character: 'mini', action: 'relaxed, eating popcorn while Lulu still barking', dialogue: 'Hết phim rồi, đồ ngốc.' }
        ]
      },
      {
        id: 'karaoke-night',
        titleKey: 'karaoke_night',
        descKey: 'karaoke_night_desc',
        scenes: [
          { character: 'lulu', action: 'holding microphone, singing loudly and off-key', dialogue: '🎵 Anh nhớ em... NHỚUU EMM 🎵' },
          { character: 'mini', action: 'ears flat, covering ears with both paws', dialogue: 'Tai tui chảy máu...' },
          { character: 'mini', action: 'grabbing microphone, singing perfectly', dialogue: '🎵 Để chị hát cho thấy đẳng cấp! 🎵' },
          { character: 'both', action: 'duet together, standing on table', dialogue: '🎵 We are the champions! 🎵' }
        ]
      }
    ],
    lifestyle: [
      {
        id: 'morning-routine',
        titleKey: 'morning_routine',
        descKey: 'morning_routine_desc',
        scenes: [
          { character: 'mini', action: 'sleeping on sofa, drooling slightly', dialogue: '(Snoring) Zzz... Cá hồi... Zzz...' },
          { character: 'lulu', action: "jumping on sofa, licking Mini's face, blurring motion", dialogue: 'Dậy đi chị Mini ơi! Trời sáng rồi! Đi chơi đi!' },
          { character: 'mini', action: 'annoyed face, pushing Lulu away with paw', dialogue: 'Tránh ra! Đang mơ đẹp... Đồ phiền phức!' },
          { character: 'both', action: 'sitting side by side looking at empty food bowls, hungry eyes', dialogue: '(Cùng nhau) Sen ơi! Đói quá!' }
        ]
      }
    ]
  } as Record<string, Array<{
    id: string;
    titleKey: string;
    descKey: string;
    scenes: Array<{ character: string; action: string; dialogue: string }>;
  }>>,

  // Legacy templates (kept for backward compatibility with existing projects)
  TEMPLATES: [
    {
      id: 'morning-routine',
      title: 'Buổi sáng của Boss',
      description: 'Mini trying to sleep while Lulu wakes her up.',
      scenes: [
        { character: 'mini', action: 'sleeping on sofa, drooling slightly', dialogue: '(Snoring) Zzz... Cá hồi... Zzz...' },
        { character: 'lulu', action: "jumping on sofa, licking Mini's face, blurring motion", dialogue: 'Dậy đi chị Mini ơi! Trời sáng rồi! Đi chơi đi!' },
        { character: 'mini', action: 'annoyed face, pushing Lulu away with paw', dialogue: 'Tránh ra! Đang mơ đẹp... Đồ phiền phức!' },
        { character: 'both', action: 'sitting side by side looking at empty food bowls, hungry eyes', dialogue: '(Cùng nhau) Sen ơi! Đói quá!' }
      ]
    },
    {
      id: 'cooking-fail',
      title: 'Thảm Họa Nấu Ăn',
      description: 'Mini tries to cook, Lulu makes a mess.',
      scenes: [
        { character: 'mini', action: 'wearing chef hat, stirring pot with serious face', dialogue: 'Hôm nay trổ tài làm món Pate thượng hạng!' },
        { character: 'lulu', action: 'running around with a bag of flour, white powder everywhere', dialogue: 'Em phụ chị với! Bột mì nè!' },
        { character: 'mini', action: 'covered in flour, angry expression, holding a spoon', dialogue: 'LULU!!! Ra khỏi bếp NGAY!' },
        { character: 'lulu', action: 'sitting in corner covered in flour, looking guilty but cute', dialogue: 'Em chỉ muốn giúp thôi mà...' }
      ]
    },
    {
      id: 'gym-workout',
      title: 'Tập Gym Giảm Béo',
      description: 'Mini tries to exercise, Lulu thinks it is playtime.',
      scenes: [
        { character: 'mini', action: 'lying on yoga mat, lifting tiny dumbbells, sweating', dialogue: 'Mục tiêu: Giảm 2 lạng mỡ thừa!' },
        { character: 'lulu', action: 'biting the yoga mat and pulling it away', dialogue: 'Chơi kéo co đi chị ơi!' },
        { character: 'mini', action: 'faceplanted on floor, annoyed', dialogue: 'Mất hết cả hứng tập...' },
        { character: 'both', action: 'sleeping together on the yoga mat', dialogue: '(Cùng nhau) Thôi mai tập tiếp...' }
      ]
    },
    {
      id: 'scary-movie',
      title: 'Xem Phim Ma',
      description: 'Watching a horror movie together.',
      scenes: [
        { character: 'both', action: 'sitting in dark room with popcorn, staring at TV screen, scared faces', dialogue: 'Nghe nói phim này ghê lắm...' },
        { character: 'mini', action: 'hiding behind cushion, only eyes visible', dialogue: 'Á! Con gì kìa!' },
        { character: 'lulu', action: 'barking at the TV screen bravely', dialogue: 'Gâu! Đừng sợ, có em bảo vệ!' },
        { character: 'mini', action: 'relaxed, eating popcorn while Lulu still barking', dialogue: 'Hết phim rồi, đồ ngốc.' }
      ]
    }
  ]
};
