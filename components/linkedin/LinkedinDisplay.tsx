// LinkedInDisplay.tsx
import {
  Building2,
  Globe,
  MapPin,
  Users2,
  Link as LinkIcon,
  UserCircle2,
  Phone,
  Mail,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import Image from 'next/image';

interface LinkedInData {
  text: string;
  url: string;
  image: string;
  title: string;
}

// ─── parsers ─────────────────────────────────────────────────────────────────

/** Strip a leading `: ` and a trailing ` -` left by the marker extractor. */
function cleanValue(raw: string): string {
  return raw.replace(/^[\s:]+/, '').replace(/[\s\-]+$/, '').trim();
}

/**
 * The aggregator pages Exa fetches encode data as:
 *   "City, Country - Homepage: foo.com - Ownership: Public - ..."
 * Split only on " - " that is immediately followed by "CapitalWord(s):"
 * so that dashes inside values (phone numbers, names) are preserved.
 */
function parseKeyValueBlob(blob: string): { city: string; fields: Map<string, string> } {
  const segments = blob.split(/ - (?=[A-Z][a-zA-Z ]+:)/);
  const fields = new Map<string, string>();
  let city = '';

  segments.forEach((seg, i) => {
    const colonIdx = seg.indexOf(':');
    if (colonIdx < 0) {
      // No colon → it is the plain city/location (always the first segment)
      if (i === 0) city = seg.replace(/^[\s:]+/, '').trim();
      return;
    }
    const key = seg.substring(0, colonIdx).trim();
    const value = seg.substring(colonIdx + 1).trim().replace(/\s*-\s*$/, '');
    if (key && value) fields.set(key, value);
  });

  return { city, fields };
}

function extractMarker(text: string, marker: string): string {
  const END_MARKERS = [
    'Industry', 'Company size', 'Headquarters', 'Type',
    'Locations', 'Employees at', 'Updates', '\n\n',
  ];
  const index = text.indexOf(marker);
  if (index === -1) return '';
  const start = index + marker.length;
  let end = text.length;
  for (const m of END_MARKERS) {
    const next = text.indexOf(m, start);
    if (next !== -1 && next < end && next > start) end = next;
  }
  return cleanValue(text.substring(start, end));
}

interface Parsed {
  name: string;
  description: string;
  industry: string;
  companySize: string;
  headquarters: string;
  type: string;
  website: string;
  parentCompany: string;
  ownership: string;
  stockSymbol: string;
  phone: string;
  email: string;
  followers: string;
  linkedinUrl: string;
  logo: string;
}

function processLinkedInText(data: LinkedInData): Parsed {
  const t = data.text;

  const rawHQ = extractMarker(t, 'Headquarters');
  const { city, fields } = parseKeyValueBlob(rawHQ);

  const followersMatch = t.match(/(\d[\d,]+)\s+followers/);

  return {
    name: data.title.replace(/\s*(-|\|)\s*LinkedIn\s*$/i, '').trim(),
    description: (() => {
      const i = t.indexOf('About us');
      return i !== -1 ? cleanValue(t.substring(i + 8)).split('\n')[0].trim() : '';
    })(),
    industry:   cleanValue(extractMarker(t, 'Industry')),
    companySize: cleanValue(extractMarker(t, 'Company size')),
    type:       cleanValue(extractMarker(t, 'Type')),
    headquarters: city,
    website:     fields.get('Homepage') ?? '',
    parentCompany: fields.get('Parent Company') ?? '',
    ownership:   fields.get('Ownership') ?? fields.get('Status') ?? '',
    stockSymbol: fields.get('Stock Symbols') ?? fields.get('Stock Symbol') ?? '',
    phone:       fields.get('Phone') ?? '',
    email:       fields.get('Emails') ?? fields.get('Email') ?? '',
    followers:   fields.get('Linkedin Followers') ?? (followersMatch ? followersMatch[1] : ''),
    linkedinUrl: data.url,
    logo:        data.image,
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Field({
  icon,
  label,
  value,
  href,
  fullWidth = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="text-blue-500 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all block truncate"
            title={value}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-800 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function LinkedInDisplay({ data }: { data: LinkedInData }) {
  const p = processLinkedInText(data);

  // Collect grid fields — only include those with a value
  const primaryFields: Array<{ icon: React.ReactNode; label: string; value: string; href?: string; fullWidth?: boolean }> = [
    p.headquarters && { icon: <MapPin className="w-4 h-4" />,     label: 'Headquarters', value: p.headquarters },
    p.industry     && { icon: <Globe className="w-4 h-4" />,      label: 'Industry',     value: p.industry },
    p.companySize  && { icon: <Users2 className="w-4 h-4" />,     label: 'Company size', value: p.companySize },
    p.ownership    && { icon: <Building2 className="w-4 h-4" />,  label: 'Ownership',    value: p.ownership },
    p.parentCompany && { icon: <Briefcase className="w-4 h-4" />, label: 'Parent company', value: p.parentCompany },
    p.stockSymbol  && { icon: <TrendingUp className="w-4 h-4" />, label: 'Stock symbol', value: p.stockSymbol },
    p.followers    && { icon: <UserCircle2 className="w-4 h-4" />, label: 'LinkedIn followers', value: p.followers },
    p.phone        && { icon: <Phone className="w-4 h-4" />,      label: 'Phone',        value: p.phone },
    p.email        && { icon: <Mail className="w-4 h-4" />,       label: 'Email',        value: p.email, href: `mailto:${p.email}` },
    p.website      && { icon: <Globe className="w-4 h-4" />,      label: 'Website',      value: p.website, href: `https://${p.website.replace(/^https?:\/\//, '')}`, fullWidth: true },
    p.linkedinUrl  && { icon: <LinkIcon className="w-4 h-4" />,   label: 'LinkedIn',     value: p.linkedinUrl, href: p.linkedinUrl, fullWidth: true },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label: string; value: string; href?: string; fullWidth?: boolean }>;

  return (
    <div className="bg-white border shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center gap-5 px-6 pt-6 pb-5 border-b">
        {p.logo && (
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src={p.logo}
              alt={`${p.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{p.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.industry    && <Pill label={p.industry} />}
            {p.ownership   && <Pill label={p.ownership} />}
            {p.companySize && <Pill label={p.companySize} />}
          </div>
        </div>
      </div>

      {/* Description */}
      {p.description && (
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{p.description}</p>
        </div>
      )}

      {/* Fields grid */}
      {primaryFields.length > 0 && (
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {primaryFields.map(({ icon, label, value, href, fullWidth }) => (
            <Field key={label} icon={icon} label={label} value={value} href={href} fullWidth={fullWidth} />
          ))}
        </div>
      )}
    </div>
  );
}