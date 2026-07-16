interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/companies/${id}`,
    {
      cache: "no-store",
    }
  );

  const company = await res.json();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">
        {company.companyName}
      </h1>

      <div className="rounded-lg border p-6 space-y-3">
        <p>
          <strong>Contact:</strong> {company.contactPerson}
        </p>

        <p>
          <strong>Mobile:</strong> {company.mobile}
        </p>

        <p>
          <strong>Email:</strong> {company.email}
        </p>

        <p>
          <strong>City:</strong> {company.city}
        </p>

        <p>
          <strong>Status:</strong> {company.status}
        </p>

        <p>
          <strong>Notes:</strong> {company.notes}
        </p>
      </div>
    </div>
  );
}