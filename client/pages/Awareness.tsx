import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Awareness() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold">
        Government awareness
      </h1>
      <p className="mt-2 text-muted-foreground max-w-3xl">
        Trusted information to keep rural communities safe and healthy. Based on
        advisories from the Punjab Health Department and Govt. of India.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Telemedicine do's & don'ts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Keep emergency numbers handy (108/112).</li>
              <li>
                For chest pain, severe breathlessness, or bleeding—seek ER
                immediately.
              </li>
              <li>Carry previous prescriptions and IDs for consultations.</li>
              <li>Use ORS for diarrhea; maintain hydration.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preventive care</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Vaccination schedule for children—do not miss doses.</li>
              <li>
                Use mosquito nets; eliminate standing water to prevent dengue.
              </li>
              <li>Regular BP and sugar checks for adults over 40.</li>
              <li>
                Safe pesticide handling for farmers; use masks and gloves.
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Official resources</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <a
              className="underline"
              href="https://nhm.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              National Health Mission
            </a>
            <a
              className="underline block"
              href="https://www.mohfw.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              Ministry of Health & Family Welfare
            </a>
            <a
              className="underline block"
              href="https://punjab.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              Govt. of Punjab
            </a>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Badge variant="secondary">Public service</Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is informational and not a substitute for professional
          medical advice. In emergencies, call your local helpline.
        </p>
      </div>
    </div>
  );
}
