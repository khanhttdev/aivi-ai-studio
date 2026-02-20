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
  // Category-specific template banks
  CATEGORY_TEMPLATES: {
    food: [
      {
        id: 'cooking-fail',
        titleKey: 'cooking_fail',
        descKey: 'cooking_fail_desc',
        scenes: [
          { character: 'mini', action: 'wearing chef hat, stirring pot with serious face', dialogue: 'Hôm nay trổ tài làm món Pate thượng hạng!' },
          { character: 'mini', action: 'tasting the food, making a disgusted face', dialogue: 'Eo ôi... mặn quá!' },
          { character: 'mini', action: 'trying to fix it by adding sugar', dialogue: 'Thêm chút đường chắc sẽ ổn...' },
          { character: 'mini', action: 'sitting next to a burnt pot, looking defeated', dialogue: 'Thôi... gọi đồ về ăn cho lành.' }
        ]
      },
      {
        id: 'food-review',
        titleKey: 'food_review',
        descKey: 'food_review_desc',
        scenes: [
          { character: 'mini', action: 'sitting at fancy restaurant table, putting on monocle', dialogue: 'Hôm nay sẽ review nhà hàng 5 sao này!' },
          { character: 'mini', action: 'sniffing the food elegantly', dialogue: 'Mùi thơm đấy, nhưng trình bày chưa đạt chuẩn.' },
          { character: 'mini', action: 'tasting food with judgmental face, writing notes', dialogue: 'Hmm... vị này chỉ được 7/10. Thiếu muối.' },
          { character: 'mini', action: 'leaving the restaurant with nose high in the air', dialogue: 'Tạm biệt, sẽ không quay lại!' }
        ]
      },
      {
        id: 'mukbang',
        titleKey: 'mukbang',
        descKey: 'mukbang_desc',
        scenes: [
          { character: 'mini', action: 'huge table with various gourmet dishes, camera setup', dialogue: 'Chào mọi người! Hôm nay thưởng thức tiệc hoàng gia!' },
          { character: 'mini', action: 'eating gracefully with small bites', dialogue: 'Miếng cá hồi này tươi ngon tuyệt vời.' },
          { character: 'mini', action: 'wiping mouth with napkin elegantly', dialogue: 'Ăn là một nghệ thuật.' },
          { character: 'mini', action: 'full belly, lying down gracefully', dialogue: 'No quá... cần spa thư giãn ngay.' }
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
          { character: 'mini', action: 'looking at a pile of clutter with disdain', dialogue: 'Đống lộn xộn này phải biến mất.' },
          { character: 'mini', action: 'pushing items off the table with paw', dialogue: 'Cái này bỏ, cái kia cũng bỏ.' },
          { character: 'mini', action: 'sitting proudly in an empty, clean room', dialogue: 'Hoàn hảo. Đây mới là sống!' }
        ]
      },
      {
        id: 'cleaning-day',
        titleKey: 'cleaning_day',
        descKey: 'cleaning_day_desc',
        scenes: [
          { character: 'mini', action: 'wearing cleaning headband, holding duster', dialogue: 'Hôm nay tổng vệ sinh dinh thự!' },
          { character: 'mini', action: 'dusting high shelves with serious expression', dialogue: 'Bụi bám ở đây cả trần đời rồi.' },
          { character: 'mini', action: 'sneezing from dust', dialogue: 'Hắt xì! Bụi quá!' },
          { character: 'mini', action: 'lying on clean sofa, satisfied', dialogue: 'Sạch sẽ rồi, giờ thì ngủ trưa thôi.' }
        ]
      }
    ],
    tech: [
      {
        id: 'unboxing',
        titleKey: 'unboxing',
        descKey: 'unboxing_desc',
        scenes: [
          { character: 'lulu', action: 'sitting next to a large box, tail wagging excitedly', dialogue: 'Hôm nay unbox đồ chơi công nghệ mới nè!' },
          { character: 'lulu', action: 'trying to open box with paws clumsily', dialogue: 'Mở ra nào... khó quá đi!' },
          { character: 'lulu', action: 'tearing the box apart with teeth', dialogue: 'A ha! Ra rồi!' },
          { character: 'lulu', action: 'wearing the box on head instead of using the product', dialogue: 'Cái hộp này xịn ghê! 10 điểm!' }
        ]
      },
      {
        id: 'smart-home',
        titleKey: 'smart_home',
        descKey: 'smart_home_desc',
        scenes: [
          { character: 'lulu', action: 'barking at a smart speaker', dialogue: 'Này cái loa kia! Sao mi lại nói tiếng người?' },
          { character: 'lulu', action: 'accidentally turning on disco lights properly', dialogue: 'Ủa? Sáng quá! Nhảy thôi!' },
          { character: 'lulu', action: 'chewing on the remote control', dialogue: 'Cái này ngon hơn đồ ăn nữa!' },
          { character: 'lulu', action: 'smart vacuum chasing Lulu around', dialogue: 'Cứu tôi! Con quái vật này đuổi theo tôi!' }
        ]
      }
    ],
    finance: [
      {
        id: 'saving-money',
        titleKey: 'saving_money',
        descKey: 'saving_money_desc',
        scenes: [
          { character: 'lulu', action: 'looking at empty piggy bank, sad face', dialogue: 'Heo đất rỗng tuếch rồi...' },
          { character: 'lulu', action: 'finding a coin under the sofa', dialogue: 'Kho báu! Mình giàu rồi!' },
          { character: 'lulu', action: 'running to pet shop window', dialogue: 'Mua xương hay mua bóng đây ta?' },
          { character: 'lulu', action: 'buying everything and looking happy', dialogue: 'Tiền là để tiêu mà! Hahahaha!' }
        ]
      }
    ],
    travel: [
      {
        id: 'first-trip',
        titleKey: 'first_trip',
        descKey: 'first_trip_desc',
        scenes: [
          { character: 'lulu', action: 'wearing sunglasses and backpack, ready to go', dialogue: 'Đi du lịch thôi! Thế giới ơi ta đến đây!' },
          { character: 'lulu', action: 'running around in circles excitedly', dialogue: 'Đi đâu trước nhỉ? Công viên hay bãi biển?' },
          { character: 'lulu', action: 'chasing butterflies in a field', dialogue: 'Bướm ơiii! Đợi em với!' },
          { character: 'lulu', action: 'sleeping soundly in the backpack, exhausted', dialogue: 'Đi chơi mệt quá... khò khò...' }
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
          { character: 'mini', action: 'walking like a model on a runway (corridor)', dialogue: 'Thần thái là quan trọng nhất.' },
          { character: 'mini', action: 'posing for selfie with perfect lighting', dialogue: 'Góc nghiêng thần thánh.' },
          { character: 'mini', action: 'checking likes on phone, smirking', dialogue: 'Triệu like là chuyện bình thường.' }
        ]
      }
    ],
    health: [
      {
        id: 'gym-workout',
        titleKey: 'gym_workout',
        descKey: 'gym_workout_desc',
        scenes: [
          { character: 'mini', action: 'lying on yoga mat, lifting tiny dumbbells', dialogue: 'Mục tiêu: Giảm mỡ bụng, tăng cơ bắp!' },
          { character: 'mini', action: 'doing a difficult yoga pose flawlessly', dialogue: 'Hít vào... thở ra... thăng bằng.' },
          { character: 'mini', action: 'drinking detox water elegantly', dialogue: 'Sống healthy thật là tuyệt.' },
          { character: 'mini', action: 'looking in mirror, flexing non-existent muscles', dialogue: 'Cơ bắp cuồn cuộn rồi đây.' }
        ]
      }
    ],
    education: [
      {
        id: 'study-tips',
        titleKey: 'study_tips',
        descKey: 'study_tips_desc',
        scenes: [
          { character: 'lulu', action: 'wearing glasses (upside down), looking at book', dialogue: 'Hôm nay giáo sư Lulu sẽ dạy học!' },
          { character: 'lulu', action: 'trying to eat the homework', dialogue: 'Kiến thức này... vị hơi giấy...' },
          { character: 'lulu', action: 'falling asleep on the open book', dialogue: 'Học nhiều quá... buồn ngủ ghê...' },
          { character: 'lulu', action: 'waking up confused with ink on face', dialogue: 'Ủa? Hết giờ học chưa?' }
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
