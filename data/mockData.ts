export interface Album {
  id: string;
  titulo: string;
  artista: string;
  capaUrl: string;
  ano: string;
}

export interface Suggestion {
  id: string;
  texto: string;
}

export const mockAlbuns: Album[] = [
  { 
    id: "a1", 
    titulo: "The Slow Rush", 
    artista: "Tame Impala", 
    ano: "2020",
    capaUrl: "https://i.scdn.co/image/ab67616d0000b2732a3258554988a03399b53273" 
  },
  { 
    id: "a2", 
    titulo: "Clube da Esquina", 
    artista: "Lô Borges e Milton Nascimento", 
    ano: "1972",
    capaUrl: "https://upload.wikimedia.org/wikipedia/pt/6/6d/Clube_da_Esquina.jpg" 
  },
  { 
    id: "a3", 
    titulo: "AM", 
    artista: "Arctic Monkeys", 
    ano: "2013",
    capaUrl: "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45a452b7402777d" 
  },
  { 
    id: "a4", 
    titulo: "Currents", 
    artista: "Tame Impala", 
    ano: "2015",
    capaUrl: "https://i.scdn.co/image/ab67616d0000b273915f212a979d5e37854a901f" 
  },
  { 
    id: "a5", 
    titulo: "Bad", 
    artista: "Michael Jackson", 
    ano: "1987",
    capaUrl: "https://upload.wikimedia.org/wikipedia/en/5/51/Michael_Jackson_-_Bad.png" 
  },
];

export const mockSuggestions: Suggestion[] = [
  { id: "s1", texto: "Tame Impala" },
  { id: "s2", texto: "Arctic Monkeys" },
  { id: "s3", texto: "Michael Jackson" },
  { id: "s4", texto: "Milton Nascimento" },
  { id: "s5", texto: "Lô Borges" },
  { id: "s6", texto: "The Slow Rush" },
  { id: "s7", texto: "Clube da Esquina" },
  { id: "s8", texto: "AM" },
  { id: "s9", texto: "Currents" },
  { id: "s10", texto: "Bad" },
];