
import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Code, Terminal, Key, Type, CheckSquare, Asterisk,
  Layout, List, Search, Film, Grid, CalendarDays, Cloud, ChevronDown, Quote, Link, FileJson, Copy, Check, ChevronRight
} from 'lucide-react';

const BASE_API_URL = "https://rioruo.vercel.app/v1";

// --- Data Definitions ---

const documentationData = [
  {
    id: 'discovery',
    name: 'Discovery',
    icon: <Layout size={16} />,
    endpoints: [
      {
        path: '/v1/home',
        method: 'GET',
        description: 'Mengambil daftar anime yang sedang berlangsung (ongoing) dan yang sudah tamat (completed) yang ditampilkan di halaman utama.',
        parameters: [],
        example: '/home',
        response: 'Objek JSON berisi dua array: `ongoing_anime` dan `complete_anime`.'
      }
    ]
  },
  {
    id: 'lists',
    name: 'Lists',
    icon: <List size={16} />,
    endpoints: [
      {
        path: '/v1/ongoing-anime/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime yang sedang berlangsung dengan dukungan paginasi.',
        parameters: [
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1 jika tidak disediakan.' }
        ],
        example: '/ongoing-anime/2',
        response: 'Objek JSON yang berisi `data` (array anime) dan informasi `pagination`.'
      },
      {
        path: '/v1/complete-anime/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime yang sudah tamat dengan dukungan paginasi.',
        parameters: [
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1 jika tidak disediakan.' }
        ],
        example: '/complete-anime/5',
        response: 'Objek JSON yang berisi `data` (array anime) dan informasi `pagination`.'
      }
    ]
  },
  {
    id: 'search',
    name: 'Search',
    icon: <Search size={16} />,
    endpoints: [
      {
        path: '/v1/search/:keyword',
        method: 'GET',
        description: 'Mencari anime berdasarkan kata kunci yang diberikan.',
        parameters: [
          { name: ':keyword', type: 'string', required: true, description: 'Kata kunci untuk pencarian anime (misal: "naruto").' }
        ],
        example: '/search/jujutsu kaisen',
        response: 'Objek JSON dengan array `data` yang berisi hasil pencarian.'
      }
    ]
  },
  {
    id: 'details',
    name: 'Details',
    icon: <Film size={16} />,
    endpoints: [
      {
        path: '/v1/anime/:slug',
        method: 'GET',
        description: 'Mengambil detail lengkap dari sebuah anime berdasarkan slug-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime (misal: "1piece-sub-indo").' }
        ],
        example: '/anime/1piece-sub-indo',
        response: 'Objek JSON tunggal yang berisi semua detail anime.'
      },
      {
        path: '/v1/anime/:slug/episodes',
        method: 'GET',
        description: 'Mengambil daftar semua episode yang tersedia untuk sebuah anime.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/1piece-sub-indo/episodes',
        response: 'Objek JSON dengan array `data` yang berisi daftar episode.'
      },
      {
        path: '/v1/anime/:slug/episodes/:episode',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan nomor episodenya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' },
          { name: ':episode', type: 'number', required: true, description: 'Nomor episode yang ingin diambil.' }
        ],
        example: '/anime/1piece-sub-indo/episodes/1',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/v1/episode/:slug',
        method: 'GET',
        description: 'Mengambil detail episode berdasarkan slug episode-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari episode (misal: "wpoiec-episode-1152-sub-indo").' }
        ],
        example: '/episode/wpoiec-episode-1152-sub-indo',
        response: 'Objek JSON yang berisi detail streaming dan link download untuk episode tersebut.'
      },
      {
        path: '/v1/batch/:slug',
        method: 'GET',
        description: 'Mengambil link download batch berdasarkan slug batch-nya.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari halaman batch (misal: "wpoiec-batch-sub-indo").' }
        ],
        example: '/batch/wpoiec-batch-sub-indo',
        response: 'Objek JSON yang berisi link download batch dalam berbagai resolusi.'
      },
      {
        path: '/v1/anime/:slug/batch',
        method: 'GET',
        description: 'Mencari dan mengambil link download batch untuk sebuah anime berdasarkan slug animenya (jika tersedia).',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug unik dari anime.' }
        ],
        example: '/anime/1piece-sub-indo/batch',
        response: 'Objek JSON yang berisi link download batch atau pesan error 404 jika tidak ditemukan.'
      }
    ]
  },
  {
    id: 'metadata',
    name: 'Metadata',
    icon: <Grid size={16} />,
    endpoints: [
      {
        path: '/v1/genres',
        method: 'GET',
        description: 'Mengambil daftar semua genre yang tersedia di situs.',
        parameters: [],
        example: '/genres',
        response: 'Objek JSON dengan array `data` yang berisi daftar semua genre.'
      },
      {
        path: '/v1/genres/:slug/:page?',
        method: 'GET',
        description: 'Mengambil daftar anime berdasarkan genre tertentu dengan dukungan paginasi.',
        parameters: [
          { name: ':slug', type: 'string', required: true, description: 'Slug dari genre (misal: "action").' },
          { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default ke 1.' }
        ],
        example: '/genres/action/2',
        response: 'Objek JSON yang berisi `anime` (array anime) dan informasi `pagination`.'
      }
    ]
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: <CalendarDays size={16} />,
    endpoints: [
        {
            path: '/v1/jadwal-rilis',
            method: 'GET',
            description: 'Mengambil jadwal rilis anime mingguan yang dikelompokkan berdasarkan hari.',
            parameters: [],
            example: '/jadwal-rilis',
            response: 'Objek JSON dengan array `data`, di mana setiap elemen mewakili satu hari dan berisi daftar anime yang rilis pada hari tersebut.'
        }
    ]
  },
  {
    id: 'shortlink',
    name: 'Shortlink',
    icon: <Link size={16} />,
    endpoints: [
      {
        path: '/v1/vgd',
        method: 'POST',
        description: 'Membuat URL pendek acak menggunakan provider v.gd. Data dikirim melalui Body Request.',
        parameters: [
          { name: 'longUrl', type: 'string', required: true, description: 'URL asli yang ingin diperpendek (dalam JSON body).' }
        ],
        requestBody: {
            longUrl: "https://google.com"
        },
        example: '/vgd',
        response: 'Objek JSON berisi `originalUrl`, `shortUrl`, dan tipe.'
      },
      {
        path: '/v1/vgd/custom',
        method: 'POST',
        description: 'Membuat URL pendek dengan alias kustom. Data dikirim melalui Body Request.',
        parameters: [
          { name: 'longUrl', type: 'string', required: true, description: 'URL asli.' },
          { name: 'customAlias', type: 'string', required: true, description: 'Alias yang diinginkan (huruf, angka, strip).' }
        ],
        requestBody: {
            longUrl: "https://google.com",
            customAlias: "my-cool-link"
        },
        example: '/vgd/custom',
        response: 'Objek JSON berisi `originalUrl`, `shortUrl`, dan tipe.'
      }
    ]
  },
  {
    id: 'quotes',
    name: 'Goodreads Quotes',
    icon: <Quote size={16} />,
    endpoints: [
        {
            path: '/v1/quotes',
            method: 'GET',
            description: 'Mengambil daftar quote populer dari Goodreads (Halaman 1 Default).',
            parameters: [],
            example: '/quotes',
            response: 'Objek JSON berisi array `quotes`.'
        },
        {
            path: '/v1/quotes/:page',
            method: 'GET',
            description: 'Mengambil daftar quote populer dari Goodreads dengan spesifikasi halaman.',
            parameters: [
                { name: ':page', type: 'number', required: true, description: 'Nomor halaman.' }
            ],
            example: '/quotes/2',
            response: 'Objek JSON berisi array `quotes`.'
        },
        {
            path: '/v1/quotes/tag/:tag',
            method: 'GET',
            description: 'Mengambil daftar quote berdasarkan tag tertentu (Halaman 1 Default).',
            parameters: [
                { name: ':tag', type: 'string', required: true, description: 'Tag quote (misal: "love", "life").' }
            ],
            example: '/quotes/tag/love',
            response: 'Objek JSON berisi array `quotes`.'
        },
        {
            path: '/v1/quotes/tag/:tag/:page',
            method: 'GET',
            description: 'Mengambil daftar quote berdasarkan tag dengan spesifikasi halaman.',
            parameters: [
                { name: ':tag', type: 'string', required: true, description: 'Tag quote.' },
                { name: ':page', type: 'number', required: true, description: 'Nomor halaman.' }
            ],
            example: '/quotes/tag/love/2',
            response: 'Objek JSON berisi array `quotes`.'
        }
    ]
  },
  {
    id: 'komiku',
    name: 'Komiku',
    icon: <BookOpen size={16} />,
    endpoints: [
        {
            path: '/v1/manga/page/:page?',
            method: 'GET',
            description: 'Mengambil daftar manga terbaru dengan paginasi dari Komiku.',
            parameters: [
                { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default: 1.' }
            ],
            example: '/manga/page/1',
            response: 'Objek JSON berisi array `manga_list`.'
        },
        {
            path: '/v1/manga/popular/:page?',
            method: 'GET',
            description: 'Mengambil daftar manga populer/rekomendasi.',
            parameters: [
                { name: ':page?', type: 'number', required: false, description: 'Nomor halaman. Default: 1.' }
            ],
            example: '/manga/popular/1',
            response: 'Objek JSON berisi array `manga_list` dengan detail rekomendasi.'
        },
        {
            path: '/v1/manga/detail/:endpoint',
            method: 'GET',
            description: 'Mengambil detail lengkap manga, termasuk sinopsis dan daftar chapter.',
            parameters: [
                { name: ':endpoint', type: 'string', required: true, description: 'Slug atau endpoint manga.' }
            ],
            example: '/manga/detail/one-piece',
            response: 'Objek JSON detail manga.'
        },
        {
            path: '/v1/manga/search/:query',
            method: 'GET',
            description: 'Mencari manga berdasarkan query.',
            parameters: [
                { name: ':query', type: 'string', required: true, description: 'Kata kunci pencarian.' }
            ],
            example: '/manga/search/naruto',
            response: 'Objek JSON berisi hasil pencarian.'
        },
        {
            path: '/v1/manga/genre',
            method: 'GET',
            description: 'Mengambil daftar genre manga yang tersedia.',
            parameters: [],
            example: '/manga/genre',
            response: 'Objek JSON berisi list genre.'
        },
        {
            path: '/v1/manga/genre/:endpoint',
            method: 'GET',
            description: 'Mengambil daftar manga berdasarkan genre.',
            parameters: [
                { name: ':endpoint', type: 'string', required: true, description: 'Slug genre.' }
            ],
            example: '/manga/genre/action',
            response: 'Objek JSON daftar manga dalam genre tersebut.'
        },
        {
            path: '/v1/manga/recommended',
            method: 'GET',
            description: 'Mengambil manga yang sedang hot/direkomendasikan.',
            parameters: [],
            example: '/manga/recommended',
            response: 'Objek JSON daftar manga hot.'
        },
        {
            path: '/v1/chapter/:title',
            method: 'GET',
            description: 'Mengambil gambar-gambar dari chapter tertentu.',
            parameters: [
                { name: ':title', type: 'string', required: true, description: 'Slug chapter.' }
            ],
            example: '/chapter/one-piece-chapter-1100',
            response: 'Objek JSON berisi array link gambar chapter.'
        }
    ]
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: <Cloud size={16} />,
    endpoints: [
        {
            path: '/v1/weather/:location',
            method: 'GET',
            description: 'Mengambil data cuaca lengkap dalam format JSON dari wttr.in.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi (kota) yang ingin dicek cuacanya.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa (ISO 639-1). Default: "en".' }
            ],
            example: '/weather/Jakarta?lang=id',
            response: 'Objek JSON berisi data cuaca lengkap.'
        },
        {
            path: '/v1/weather/ascii/:location',
            method: 'GET',
            description: 'Mengambil tampilan cuaca dalam format ASCII art.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa. Default: "en".' }
            ],
            example: '/weather/ascii/Bandung?lang=id',
            response: 'String text (ASCII Art) atau JSON jika parameter format=json digunakan.'
        },
        {
            path: '/v1/weather/quick/:location',
            method: 'GET',
            description: 'Info cuaca singkat satu baris dengan format yang ditentukan (Conditions, Temperature, Humidity, Wind). Bahasa output dapat disesuaikan.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' },
                { name: '?lang', type: 'string', required: false, description: 'Kode bahasa (ISO 639-1) untuk output teks cuaca. Default: "en". Contoh: "id" untuk Bahasa Indonesia.' }
            ],
            example: '/weather/quick/Surabaya?lang=id',
            response: 'Objek JSON berisi string cuaca singkat dalam bahasa yang dipilih.'
        },
        {
            path: '/v1/weather/png/:location',
            method: 'GET',
            description: 'Mengambil gambar PNG cuaca.',
            parameters: [
                { name: ':location', type: 'string', required: true, description: 'Nama lokasi.' }
            ],
            example: '/weather/png/Bali',
            response: 'Binary image file (PNG).'
        }
    ]
  }
];

// --- Types & Helper Components ---

type Endpoint = typeof documentationData[number]['endpoints'][number] & { requestBody?: any };

interface EndpointCardProps {
  endpoint: Endpoint;
}

// --- Code Snippet Generator Logic ---

const languages = {
  Shell: ['cURL', 'cURL (Windows)', 'HTTPie', 'Wget', 'PowerShell'],
  JavaScript: ['Fetch', 'Axios', 'jQuery', 'XHR', 'Native (Node)'],
  Python: ['Requests', 'http.client'],
  Java: ['OkHttp', 'Unirest'],
  PHP: ['cURL', 'Guzzle'],
  Go: ['Native'],
  Swift: ['URLSession']
};

const generateSnippet = (lang: string, lib: string, endpoint: Endpoint) => {
  // Safe replace for example URL
  const examplePath = endpoint.example ? endpoint.example.replace('/v1', '') : '';
  const fullUrl = `${BASE_API_URL}${examplePath}`;
  const method = endpoint.method;
  const body = endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : null;
  const bodyOneLine = endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : null;

  // Defensive Check: Ensure the requested library belongs to the requested language
  // This prevents crashes during rapid tab switching where state might be momentarily out of sync
  if (!languages[lang as keyof typeof languages]?.includes(lib)) {
      return `// Loading snippet for ${lang}...`;
  }

  switch (lang) {
    case 'Shell':
      if (lib === 'cURL') {
        if (method === 'GET') return `curl -X GET "${fullUrl}"`;
        return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${bodyOneLine}'`;
      }
      if (lib === 'cURL (Windows)') {
        if (method === 'GET') return `curl "${fullUrl}"`;
        const winBody = bodyOneLine ? bodyOneLine.replace(/"/g, '\\"') : '';
        return `curl -X POST "${fullUrl}" ^
  -H "Content-Type: application/json" ^
  -d "${winBody}"`;
      }
      if (lib === 'HTTPie') {
        if (method === 'GET') return `http GET "${fullUrl}"`;
        return `echo '${bodyOneLine}' | http POST "${fullUrl}" Content-Type:application/json`;
      }
      if (lib === 'Wget') {
        if (method === 'GET') return `wget -qO- "${fullUrl}"`;
        return `wget --method=POST \\
  --header="Content-Type: application/json" \\
  --body-data='${bodyOneLine}' \\
  -qO- "${fullUrl}"`;
      }
      if (lib === 'PowerShell') {
        if (method === 'GET') return `Invoke-RestMethod -Uri "${fullUrl}" -Method Get`;
        const psBody = bodyOneLine ? bodyOneLine.replace(/"/g, '`"') : '';
        return `$body = "${psBody}"
Invoke-RestMethod -Uri "${fullUrl}" -Method Post -ContentType "application/json" -Body $body`;
      }
      break;

    case 'JavaScript':
      if (lib === 'Fetch') {
        if (method === 'GET') {
          return `fetch("${fullUrl}")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
        }
        return `fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${body})
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
      }
      if (lib === 'Axios') {
        if (method === 'GET') {
          return `const axios = require('axios');

axios.get("${fullUrl}")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
        }
        return `const axios = require('axios');

const data = ${body};

axios.post("${fullUrl}", data)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
      }
      if (lib === 'jQuery') {
        if (method === 'GET') {
          return `$.ajax({
  url: "${fullUrl}",
  method: "GET",
  success: function(data) {
    console.log(data);
  }
});`;
        }
        return `$.ajax({
  url: "${fullUrl}",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify(${body}),
  success: function(data) {
    console.log(data);
  }
});`;
      }
      if (lib === 'XHR') {
        return `var xhr = new XMLHttpRequest();
xhr.open("${method}", "${fullUrl}");
${method === 'POST' ? 'xhr.setRequestHeader("Content-Type", "application/json");' : ''}
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    console.log(xhr.status);
    console.log(xhr.responseText);
  }
};
xhr.send(${method === 'POST' ? `JSON.stringify(${body})` : 'null'});`;
      }
      if (lib === 'Native (Node)') {
        return `const https = require('https');

const options = {
  hostname: 'rioruo.vercel.app',
  path: '/v1${endpoint.example}',
  method: '${method}',
  headers: {
    ${method === 'POST' ? "'Content-Type': 'application/json'," : ''}
    'User-Agent': 'Node.js-Client'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(JSON.parse(data)); });
});

req.on('error', (e) => { console.error(e); });
${method === 'POST' ? `req.write(JSON.stringify(${body}));` : ''}
req.end();`;
      }
      break;

    case 'Python':
      if (lib === 'Requests') {
        if (method === 'GET') {
          return `import requests

url = "${fullUrl}"
response = requests.get(url)
print(response.json())`;
        }
        return `import requests
import json

url = "${fullUrl}"
payload = ${body}
headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      }
      if (lib === 'http.client') {
        return `import http.client
import json

conn = http.client.HTTPSConnection("rioruo.vercel.app")
${method === 'POST' ? `payload = json.dumps(${body})` : 'payload = ""'}
headers = {
  ${method === 'POST' ? "'Content-Type': 'application/json'" : ''}
}

conn.request("${method}", "/v1${endpoint.example}", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))`;
      }
      break;

    case 'PHP':
      if (lib === 'cURL') {
        return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  ${method === 'POST' ? `CURLOPT_POSTFIELDS => '${bodyOneLine}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json'
  ),` : ''}
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`;
      }
      if (lib === 'Guzzle') {
        const guzzleBody = body 
            ? body.replace(/{/g, '[').replace(/}/g, ']').replace(/:/g, ' =>') 
            : '[]';

        return `<?php
$client = new GuzzleHttp\\Client();
$response = $client->request('${method}', '${fullUrl}'${method === 'POST' ? `, [
  'json' => ${guzzleBody}
]` : ''});

echo $response->getBody();
?>`;
      }
      break;

    case 'Java':
      if (lib === 'OkHttp') {
        if (method === 'GET') {
          return `OkHttpClient client = new OkHttpClient().newBuilder().build();
Request request = new Request.Builder()
  .url("${fullUrl}")
  .method("GET", null)
  .build();
Response response = client.newCall(request).execute();
System.out.println(response.body().string());`;
        }
        const javaBody = bodyOneLine ? bodyOneLine.replace(/"/g, '\\"') : '';
        return `OkHttpClient client = new OkHttpClient().newBuilder().build();
MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create(mediaType, "${javaBody}");
Request request = new Request.Builder()
  .url("${fullUrl}")
  .method("POST", body)
  .addHeader("Content-Type", "application/json")
  .build();
Response response = client.newCall(request).execute();
System.out.println(response.body().string());`;
      }
      if (lib === 'Unirest') {
        if (method === 'GET') {
          return `Unirest.setTimeouts(0, 0);
HttpResponse<String> response = Unirest.get("${fullUrl}")
  .asString();
System.out.println(response.getBody());`;
        }
        const javaBody = bodyOneLine ? bodyOneLine.replace(/"/g, '\\"') : '';
        return `Unirest.setTimeouts(0, 0);
HttpResponse<String> response = Unirest.post("${fullUrl}")
  .header("Content-Type", "application/json")
  .body("${javaBody}")
  .asString();
System.out.println(response.getBody());`;
      }
      break;

    case 'Go':
      return `package main

import (
  "fmt"
  ${method === 'POST' ? '"strings"' : ''}
  "net/http"
  "io/ioutil"
)

func main() {
  url := "${fullUrl}"
  method := "${method}"
  ${method === 'POST' ? `payload := strings.NewReader(\`${bodyOneLine}\`)` : 'var payload io.Reader = nil'}

  client := &http.Client {
  }
  req, err := http.NewRequest(method, url, payload)

  if err != nil {
    fmt.Println(err)
    return
  }
  ${method === 'POST' ? 'req.Header.Add("Content-Type", "application/json")' : ''}

  res, err := client.Do(req)
  if err != nil {
    fmt.Println(err)
    return
  }
  defer res.Body.Close()

  body, err := ioutil.ReadAll(res.Body)
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(body))
}`;

    case 'Swift':
      const swiftBody = bodyOneLine ? bodyOneLine.replace(/"/g, '\\"') : '';
      return `import Foundation

var semaphore = DispatchSemaphore (value: 0)

let parameters = "${swiftBody}"
let postData = parameters.data(using: .utf8)

var request = URLRequest(url: URL(string: "${fullUrl}")!,timeoutInterval: Double.infinity)
request.httpMethod = "${method}"
${method === 'POST' ? `request.addValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = postData` : ''}

let task = URLSession.shared.dataTask(with: request) { data, response, error in 
  guard let data = data else {
    print(String(describing: error))
    semaphore.signal()
    return
  }
  print(String(data: data, encoding: .utf8)!)
  semaphore.signal()
}

task.resume()
semaphore.wait()`;

    default:
      return 'Code example not available.';
  }
};

const RequestExample: React.FC<{ endpoint: Endpoint }> = ({ endpoint }) => {
  const [activeLang, setActiveLang] = useState<string>('Shell');
  const [activeLib, setActiveLib] = useState<string>(languages['Shell'][0]);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // FIX: Instead of useEffect which causes a render race condition,
  // we update the Library immediately when Language changes.
  const handleLangChange = (lang: string) => {
    setActiveLang(lang);
    // Reset library to the first one available for this language immediately
    setActiveLib(languages[lang as keyof typeof languages][0]);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const code = generateSnippet(activeLang, activeLib, endpoint);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 border border-border rounded-xl bg-[#0a0a0a] relative">
      <div className="flex items-center justify-between border-b border-white/5 bg-surface px-2 relative z-20 rounded-t-xl">
        <div className="flex overflow-x-auto custom-scrollbar">
          {Object.keys(languages).map(lang => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLang === lang 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-2">
           {/* Custom Styled Dropdown for Library/Variant */}
           <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#252525] text-zinc-300 text-xs py-1.5 px-3 rounded border border-white/10 hover:border-white/20 transition-all focus:outline-none min-w-[100px] justify-between"
              >
                <span>{activeLib}</span>
                <ChevronDown size={12} className={`text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-[#1e1e1e] border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-1">
                    {languages[activeLang as keyof typeof languages].map(lib => (
                      <button
                        key={lib}
                        onClick={() => {
                          setActiveLib(lib);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between group transition-colors ${
                          activeLib === lib 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {lib}
                        {activeLib === lib && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-zinc-200 text-[10px] px-2.5 py-1.5 rounded-md border border-white/10 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed text-zinc-300 rounded-b-xl">
          <code dangerouslySetInnerHTML={{ 
            __html: code
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-orange-300">$1</span>') // strings
              .replace(/\b(curl|fetch|const|var|let|import|from|class|function|return|if|else|true|false|null|await|async|new|void|int|public|private)\b/g, '<span class="text-purple-400">$1</span>') // keywords
              .replace(/\b(GET|POST)\b/g, '<span class="text-blue-400 font-bold">$1</span>') // methods
              .replace(/(\/\/.*)/g, '<span class="text-zinc-500 italic">$1</span>') // comments
          }} />
        </pre>
      </div>
    </div>
  );
};

const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => (
  <div className="bg-surface border border-border rounded-xl mb-8">
    <div className="px-5 py-4 bg-surfaceLight border-b border-border rounded-t-xl">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${endpoint.method === 'POST' ? 'bg-warning/20 text-warning border-warning/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
            {endpoint.method}
        </span>
        <code className="text-sm font-semibold text-white tracking-wide">{endpoint.path}</code>
      </div>
      <p className="text-zinc-400 text-sm mt-2">{endpoint.description}</p>
    </div>
    
    <div className="p-5">
      {endpoint.parameters.length > 0 && (
        <>
          <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Key size={14}/> Parameters</h4>
          <div className="space-y-3">
            {endpoint.parameters.map(param => (
              <div key={param.name} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-sm">
                <div className="md:col-span-3 flex items-center gap-2">
                  <code className="font-mono text-primary">{param.name}</code>
                  {param.required ? <Asterisk size={12} className="text-error"/> : <CheckSquare size={12} className="text-zinc-500"/>}
                </div>
                <div className="md:col-span-2 text-zinc-400 font-mono flex items-center gap-2"><Type size={14}/> {param.type}</div>
                <div className="md:col-span-7 text-zinc-500">{param.description}</div>
              </div>
            ))}
          </div>
          <div className="border-b border-border my-5"></div>
        </>
      )}

      {/* Render Request Body if it exists (For POST requests), BUT HIDE for VGD endpoints as requested */}
      {endpoint.requestBody && !endpoint.path.includes('/vgd') && (
        <div className="mb-5">
            <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2"><FileJson size={14}/> Request Body (JSON)</h4>
            <div className="w-full bg-[#0d0d0d] border border-border rounded-lg p-3 overflow-x-auto">
                <pre className="font-mono text-xs text-orange-300">
                    {JSON.stringify(endpoint.requestBody, null, 2)}
                </pre>
            </div>
            <div className="border-b border-border my-5"></div>
        </div>
      )}

      {/* Request Code Generator Section */}
      <div className="mb-6">
         <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2"><Code size={14}/> Request Example</h4>
         <RequestExample endpoint={endpoint} />
      </div>

      <div>
        <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2"><Terminal size={14}/> Example {endpoint.method === 'POST' ? 'Path' : 'Request'}</h4>
        <code className="w-full block bg-surfaceLight border border-border rounded-lg p-3 text-sm text-emerald-300 font-mono break-all">
          /v1{endpoint.example}
        </code>
      </div>
       <div className="mt-4">
        <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2"><ChevronRight size={14}/> Expected Response</h4>
        <p className="text-sm text-zinc-400">{endpoint.response}</p>
      </div>
    </div>
  </div>
);

export function Documentation() {
  const [activeSection, setActiveSection] = useState(documentationData[0].id);
  const [isOtakudesuExpanded, setOtakudesuExpanded] = useState(true);
  const [isWeatherExpanded, setWeatherExpanded] = useState(false);
  const [isKomikuExpanded, setKomikuExpanded] = useState(false);
  const [isQuotesExpanded, setQuotesExpanded] = useState(false);
  const [isShortlinkExpanded, setIsShortlinkExpanded] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const otakudesuDocs = documentationData.filter(sect => !['weather', 'komiku', 'quotes', 'shortlink'].includes(sect.id));
  const weatherDocs = documentationData.filter(sect => sect.id === 'weather');
  const komikuDocs = documentationData.filter(sect => sect.id === 'komiku');
  const quoteDocs = documentationData.filter(sect => sect.id === 'quotes');
  const shortlinkDocs = documentationData.filter(sect => sect.id === 'shortlink');

  useEffect(() => {
    const handleScroll = () => {
      const mainNode = mainContentRef.current;
      if (!mainNode) return;

      let currentSectionId = activeSection;
      for (const section of documentationData) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in the top part of the viewport
          if (rect.top >= 0 && rect.top < 150) {
            currentSectionId = section.id;
            break;
          }
        }
      }
      setActiveSection(currentSectionId);
    };

    const mainEl = mainContentRef.current;
    mainEl?.addEventListener('scroll', handleScroll);
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, [activeSection]);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8 animate-in fade-in duration-300">
      {/* Sidebar */}
      <aside className="md:w-1/4 md:sticky md:top-20 self-start">
         <div className="p-1 bg-surface border border-border rounded-xl">
           <h3 className="flex items-center gap-2 text-sm font-bold text-white p-3"><BookOpen size={16} className="text-primary"/> API Endpoints</h3>
           <nav className="flex flex-col gap-1 p-2">
            
            {/* Otakudesu Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setOtakudesuExpanded(!isOtakudesuExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isOtakudesuExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isOtakudesuExpanded ? 'bg-primary' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Otakudesu</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isOtakudesuExpanded ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isOtakudesuExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {otakudesuDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Komiku Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setKomikuExpanded(!isKomikuExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isKomikuExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isKomikuExpanded ? 'bg-warning' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Komiku</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isKomikuExpanded ? 'rotate-180 text-warning' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isKomikuExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {komikuDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-warning' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Quotes Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setQuotesExpanded(!isQuotesExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isQuotesExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isQuotesExpanded ? 'bg-purple-500' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Quotes</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isQuotesExpanded ? 'rotate-180 text-purple-500' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isQuotesExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {quoteDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-purple-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Shortlink Group Wrapper */}
            <div className="space-y-1 mb-4">
                <button 
                  onClick={() => setIsShortlinkExpanded(!isShortlinkExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isShortlinkExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isShortlinkExpanded ? 'bg-orange-500' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Shortlink</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isShortlinkExpanded ? 'rotate-180 text-orange-500' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isShortlinkExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {shortlinkDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-orange-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* Weather Group Wrapper */}
            <div className="space-y-1">
                <button 
                  onClick={() => setWeatherExpanded(!isWeatherExpanded)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isWeatherExpanded 
                      ? 'bg-surfaceLight border-white/5 text-white shadow-sm' 
                      : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full transition-colors ${isWeatherExpanded ? 'bg-info' : 'bg-zinc-700 group-hover:bg-zinc-500'}`} />
                    <span>Weather</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-500 transition-transform duration-300 ${isWeatherExpanded ? 'rotate-180 text-info' : ''}`} 
                  />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out pl-4 ${isWeatherExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden border-l border-white/5 ml-2 pl-2 pt-1 space-y-1">
                    {weatherDocs.map(section => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors font-mono group ${
                          activeSection === section.id
                            ? 'bg-info/10 text-info border border-info/20'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`transition-colors ${activeSection === section.id ? 'text-info' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                           {section.icon}
                        </div>
                        <span>{section.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

           </nav>
         </div>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="md:w-3/4 md:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">API Documentation</h1>
            <p className="text-zinc-400 mt-2">Panduan lengkap untuk menggunakan RioRuo API. Semua endpoint mengembalikan respons dalam format JSON.</p>
        </div>
        
        {documentationData.map(section => (
          <section key={section.id} id={section.id} className="pt-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-3">
                {section.icon} {section.name}
            </h2>
            {section.endpoints.map(endpoint => (
              <EndpointCard key={endpoint.path} endpoint={endpoint} />
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
