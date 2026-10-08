export interface Movie {
  id: number;
  title: string;
  genre: string;
  image: string;
  rating: string;
  language: string;
  duration?: string;
  status?: string;
  trailer?: string;
}

export const trailerMap: Record<string, string> = {
  // Tamil
  leo: "https://www.youtube.com/embed/ShsFxGV_thk",
  jailer: "https://www.youtube.com/embed/Y5BeWdODPqo",
  vikram: "https://www.youtube.com/embed/OKBMCL-frPU",
  maharaja: "https://www.youtube.com/embed/z37hCm4eges",
  amaran: "https://www.youtube.com/embed/UPKLS4pRnSo",
  "ponniyin selvan": "https://www.youtube.com/embed/D4qAQYlgZQs",
  viduthalai: "https://www.youtube.com/embed/GYeSfq_bj_M",
  goat: "https://www.youtube.com/embed/jxCRlebiebw",
  "the greatest of all time": "https://www.youtube.com/embed/jxCRlebiebw",
  "the greatest of all time (goat)": "https://www.youtube.com/embed/jxCRlebiebw",

  // Malayalam
  "manjummel boys": "https://www.youtube.com/embed/id848Ww1YLo",
  aavesham: "https://www.youtube.com/embed/L0yEMl8PXnw",
  premalu: "https://www.youtube.com/embed/rR_2ti4l3nM",
  "the goat life": "https://www.youtube.com/embed/qvsiJKdDxPs",
  "the goat life (aadujeevitham)": "https://www.youtube.com/embed/qvsiJKdDxPs",
  aadujeevitham: "https://www.youtube.com/embed/qvsiJKdDxPs",
  bramayugam: "https://www.youtube.com/embed/7FLxInubR5Q",
  arm: "https://www.youtube.com/embed/rFgS10V8908",
  "arm (ajayante randam moshanam)": "https://www.youtube.com/embed/rFgS10V8908",
  "ajayante randam moshanam": "https://www.youtube.com/embed/rFgS10V8908",

  // Telugu
  "pushpa 2": "https://www.youtube.com/embed/g3JUbgOHgdw",
  "pushpa 2: the rule": "https://www.youtube.com/embed/g3JUbgOHgdw",
  "kalki 2898 ad": "https://www.youtube.com/embed/kQDd1AhGIHk",
  "devara: part 1": "https://www.youtube.com/embed/mmKIkTLRZao",
  devara: "https://www.youtube.com/embed/mmKIkTLRZao",
  "salaar: part 1 - ceasefire": "https://www.youtube.com/embed/4GPvYMKtrtI",
  "salaar: part 1": "https://www.youtube.com/embed/4GPvYMKtrtI",
  salaar: "https://www.youtube.com/embed/4GPvYMKtrtI",
  rrr: "https://www.youtube.com/embed/NgBoMJy386M",
  "hanu-man": "https://www.youtube.com/embed/Oqvly3MvlXA",
  hanuman: "https://www.youtube.com/embed/Oqvly3MvlXA",

  // Hindi
  jawan: "https://www.youtube.com/embed/MWOlnZSnXJo",
  "stree 2": "https://www.youtube.com/embed/KVnheXywIbY",
  animal: "https://www.youtube.com/embed/Dydmpfo68DA",
  pathaan: "https://www.youtube.com/embed/vqu4z34wENw",
  fighter: "https://www.youtube.com/embed/6amIq_mP4xM",
  "12th fail": "https://www.youtube.com/embed/KjbtuqENvVE",
};

export const defaultMoviesList: Movie[] = [
  /* ================= TAMIL ================= */
  {
    id: 14,
    title: "Leo",
    genre: "Action / Thriller",
    image: "/leo.jpg",
    rating: "8.2",
    language: "Tamil",
    duration: "164 min",
    status: "Active",
    trailer: trailerMap["leo"],
  },
  {
    id: 19,
    title: "Jailer",
    genre: "Action / Comedy",
    image: "/jailer.jpg",
    rating: "7.9",
    language: "Tamil",
    duration: "168 min",
    status: "Active",
    trailer: trailerMap["jailer"],
  },
  {
    id: 16,
    title: "Vikram",
    genre: "Action / Thriller",
    image: "/vikram.jpg",
    rating: "8.6",
    language: "Tamil",
    duration: "173 min",
    status: "Active",
    trailer: trailerMap["vikram"],
  },
  {
    id: 15,
    title: "Maharaja",
    genre: "Crime / Thriller",
    image: "/maharaja.jpg",
    rating: "8.5",
    language: "Tamil",
    duration: "142 min",
    status: "Active",
    trailer: trailerMap["maharaja"],
  },
  {
    id: 20,
    title: "Amaran",
    genre: "Action / Biopic",
    image: "/amaran.jpg",
    rating: "8.8",
    language: "Tamil",
    duration: "155 min",
    status: "Active",
    trailer: trailerMap["amaran"],
  },
  {
    id: 18,
    title: "Ponniyin Selvan",
    genre: "Historical / Drama",
    image: "/ponniyinselvan.jpg",
    rating: "8.1",
    language: "Tamil",
    duration: "167 min",
    status: "Active",
    trailer: trailerMap["ponniyin selvan"],
  },
  {
    id: 17,
    title: "Viduthalai",
    genre: "Crime / Drama",
    image: "/viduthalai.jpg",
    rating: "8.3",
    language: "Tamil",
    duration: "150 min",
    status: "Active",
    trailer: trailerMap["viduthalai"],
  },
  {
    id: 21,
    title: "The Greatest of All Time (GOAT)",
    genre: "Sci-Fi / Action",
    image: "/goat.jpg",
    rating: "8.0",
    language: "Tamil",
    duration: "179 min",
    status: "Active",
    trailer: trailerMap["goat"],
  },

  /* ================= MALAYALAM ================= */
  {
    id: 31,
    title: "Manjummel Boys",
    genre: "Survival / Adventure",
    image: "/manjummelboys.jpg",
    rating: "8.6",
    language: "Malayalam",
    duration: "135 min",
    status: "Active",
    trailer: trailerMap["manjummel boys"],
  },
  {
    id: 32,
    title: "Aavesham",
    genre: "Action / Comedy",
    image: "/aavesham.jpg",
    rating: "8.4",
    language: "Malayalam",
    duration: "158 min",
    status: "Active",
    trailer: trailerMap["aavesham"],
  },
  {
    id: 33,
    title: "Premalu",
    genre: "Romance / Comedy",
    image: "/premalu.jpg",
    rating: "8.2",
    language: "Malayalam",
    duration: "156 min",
    status: "Active",
    trailer: trailerMap["premalu"],
  },
  {
    id: 34,
    title: "The Goat Life (Aadujeevitham)",
    genre: "Survival / Drama",
    image: "/aadujeevitham.jpg",
    rating: "8.5",
    language: "Malayalam",
    duration: "172 min",
    status: "Active",
    trailer: trailerMap["the goat life"],
  },
  {
    id: 35,
    title: "Bramayugam",
    genre: "Horror / Thriller",
    image: "/bramayugam.jpg",
    rating: "8.3",
    language: "Malayalam",
    duration: "139 min",
    status: "Active",
    trailer: trailerMap["bramayugam"],
  },
  {
    id: 36,
    title: "ARM (Ajayante Randam Moshanam)",
    genre: "Action / Fantasy",
    image: "/arm.jpg",
    rating: "8.1",
    language: "Malayalam",
    duration: "148 min",
    status: "Active",
    trailer: trailerMap["arm"],
  },

  /* ================= TELUGU ================= */
  {
    id: 41,
    title: "Pushpa 2: The Rule",
    genre: "Action / Crime",
    image: "/pushpa2.jpg",
    rating: "8.7",
    language: "Telugu",
    duration: "195 min",
    status: "Active",
    trailer: trailerMap["pushpa 2"],
  },
  {
    id: 42,
    title: "Kalki 2898 AD",
    genre: "Sci-Fi / Mythological",
    image: "/kalki.jpg",
    rating: "8.5",
    language: "Telugu",
    duration: "181 min",
    status: "Active",
    trailer: trailerMap["kalki 2898 ad"],
  },
  {
    id: 43,
    title: "Devara: Part 1",
    genre: "Action / Drama",
    image: "/devara.jpg",
    rating: "8.0",
    language: "Telugu",
    duration: "178 min",
    status: "Active",
    trailer: trailerMap["devara"],
  },
  {
    id: 44,
    title: "Salaar: Part 1 - Ceasefire",
    genre: "Action / Crime",
    image: "/salaar.jpg",
    rating: "8.3",
    language: "Telugu",
    duration: "175 min",
    status: "Active",
    trailer: trailerMap["salaar"],
  },
  {
    id: 45,
    title: "RRR",
    genre: "Epic / Action / Drama",
    image: "/rrr.jpg",
    rating: "8.8",
    language: "Telugu",
    duration: "187 min",
    status: "Active",
    trailer: trailerMap["rrr"],
  },
  {
    id: 46,
    title: "Hanu-Man",
    genre: "Superhero / Fantasy",
    image: "/hanuman.jpg",
    rating: "8.2",
    language: "Telugu",
    duration: "158 min",
    status: "Active",
    trailer: trailerMap["hanu-man"],
  },

  /* ================= HINDI ================= */
  {
    id: 51,
    title: "Jawan",
    genre: "Action / Thriller",
    image: "/jawan.jpg",
    rating: "8.1",
    language: "Hindi",
    duration: "169 min",
    status: "Active",
    trailer: trailerMap["jawan"],
  },
  {
    id: 52,
    title: "Stree 2",
    genre: "Horror / Comedy",
    image: "/stree2.jpg",
    rating: "8.3",
    language: "Hindi",
    duration: "147 min",
    status: "Active",
    trailer: trailerMap["stree 2"],
  },
  {
    id: 53,
    title: "Animal",
    genre: "Action / Drama",
    image: "/animal.jpg",
    rating: "8.0",
    language: "Hindi",
    duration: "201 min",
    status: "Active",
    trailer: trailerMap["animal"],
  },
  {
    id: 54,
    title: "Pathaan",
    genre: "Action / Spy",
    image: "/pathaan.jpg",
    rating: "7.8",
    language: "Hindi",
    duration: "146 min",
    status: "Active",
    trailer: trailerMap["pathaan"],
  },
  {
    id: 55,
    title: "Fighter",
    genre: "Aerial / Action",
    image: "/fighter.jpg",
    rating: "7.9",
    language: "Hindi",
    duration: "166 min",
    status: "Active",
    trailer: trailerMap["fighter"],
  },
  {
    id: 56,
    title: "12th Fail",
    genre: "Drama / Inspirational",
    image: "/12thfail.jpg",
    rating: "8.9",
    language: "Hindi",
    duration: "147 min",
    status: "Active",
    trailer: trailerMap["12th fail"],
  },
];

export function getMovieTrailer(movieOrTitle: Movie | string): string {
  const title = typeof movieOrTitle === "string" ? movieOrTitle : movieOrTitle?.title || "";
  const key = title.trim().toLowerCase();

  if (trailerMap[key]) return trailerMap[key];

  for (const [k, url] of Object.entries(trailerMap)) {
    if (k && (key.includes(k) || k.includes(key))) {
      return url;
    }
  }

  if (typeof movieOrTitle === "object" && movieOrTitle?.trailer) {
    return movieOrTitle.trailer;
  }

  return "https://www.youtube.com/embed/ShsFxGV_thk";
}

export function getMoviePoster(movieOrTitle: Movie | string): string {
  const title = typeof movieOrTitle === "string" ? movieOrTitle : movieOrTitle?.title || "";
  const key = title.trim().toLowerCase();

  const found = defaultMoviesList.find(
    (m) =>
      m.title.trim().toLowerCase() === key ||
      key.includes(m.title.trim().toLowerCase()) ||
      m.title.trim().toLowerCase().includes(key)
  );
  if (found && found.image) return found.image;

  if (typeof movieOrTitle === "object" && movieOrTitle?.image) {
    return movieOrTitle.image;
  }

  return "/leo.jpg";
}

