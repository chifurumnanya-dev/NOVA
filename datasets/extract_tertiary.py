import csv

input_path = '/Users/mac/Projects/NOVA/datasets/GRID3_NGA_health_facilities_v2_0_3768559736750290399.csv'
output_path = '/Users/mac/Projects/NOVA/datasets/tertiary_hospitals_extraction.csv'

tertiary_keywords = ['tertiary', 'teaching', 'specialized']

extracted_rows = []
with open(input_path, mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        level = row.get('facility_level', '').lower()
        option = row.get('facility_level_option', '').lower()
        name = row.get('facility_name', '').lower()
        
        is_tertiary = (
            'tertiary' in level or 
            'teaching' in option or 
            'specialized' in option or
            'teaching' in name or
            'federal medical center' in name or
            'fmc' in name
        )
        
        if is_tertiary:
            extracted_rows.append(row)

if extracted_rows:
    keys = extracted_rows[0].keys()
    with open(output_path, mode='w', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(extracted_rows)
    print(f"Extracted {len(extracted_rows)} tertiary hospitals to {output_path}")
else:
    print("No tertiary hospitals found.")
