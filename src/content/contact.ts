import type { ContactChannel, CvInfo } from './types';

/**
 * Contact channels. LinkedIn and GitHub URLs were not supplied in the resume:
 * set `href` once known — until then the UI shows the label only (no link).
 */
export const contacts: readonly ContactChannel[] = [
  {
    id: 'email',
    label: 'Email',
    display: 'achinthabandara1@gmail.com',
    href: 'mailto:achinthabandara1@gmail.com',
  },
  { id: 'phone', label: 'Phone', display: '+94 71 776 10 31', href: 'tel:+94717761031' },
  { id: 'linkedin', label: 'LinkedIn', display: 'achinthabandara', href: null },
  { id: 'github', label: 'GitHub', display: 'GitHub profile', href: null },
];

/**
 * CV download. Place the PDF at `public/cv/Achintha_Bandara_CV.pdf` and set
 * `path: 'cv/Achintha_Bandara_CV.pdf'` to enable all "Download CV" actions.
 */
export const cv: CvInfo = {
  path: null,
  fileName: 'Achintha_Bandara_CV.pdf',
};
