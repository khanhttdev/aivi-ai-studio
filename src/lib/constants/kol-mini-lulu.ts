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
      image: '/images/kol-mini-lulu/mini-preview.jpg', // Placeholder
    },
    LULU: {
      id: 'lulu',
      name: 'Lulu',
      species: 'Dog',
      breed: 'Golden Retriever',
      description: 'The Sidekick. Clumsy, energetic, happy-go-lucky.',
      visual_prompt: 'golden retriever puppy, golden fluffy fur, happy tongue out expression, wearing a blue bandana, dynamic pose, friendly eyes, wagging tail',
      voice_style: 'Energetic, dopey, childish male',
      image: '/images/kol-mini-lulu/lulu-preview.jpg', // Placeholder
    }
  },
  STYLE: {
    BASE_PROMPT: '3d disney pixar style, animated movie character, high quality 3d render, unreal engine 5, octane render, cute, fluffy texture, expressive eyes, bright cinematic lighting, soft pastel colors, 8k resolution'
  },
  TEMPLATES: [
    {
      id: 'morning-routine',
      title: 'Buổi sáng của Boss',
      description: 'Mini trying to sleep while Lulu wakes her up.',
      scenes: [
        {
          character: 'mini',
          action: 'sleeping on sofa, drooling slightly',
          dialogue: '(Snoring) Zzz... Cá hồi... Zzz...'
        },
        {
          character: 'lulu',
          action: 'jumping on sofa, licking Mini\'s face, blurring motion',
          dialogue: 'Dậy đi chị Mini ơi! Trời sáng rồi! Đi chơi đi!'
        },
        {
          character: 'mini',
          action: 'annoyed face, pushing Lulu away with paw',
          dialogue: 'Tránh ra! Đang mơ đẹp... Đồ phiền phức!'
        },
        {
          character: 'both',
          action: 'Mini and Lulu sitting side by side looking at empty food bowls, hungry eyes',
          dialogue: '(Cùng nhau) Sen ơi! Đói quá!'
        }
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
