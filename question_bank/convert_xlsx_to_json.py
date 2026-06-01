import zipfile
import xml.etree.ElementTree as ET
import json
import os
import sys

def convert_xlsx_to_json(xlsx_path, json_path):
    if not os.path.exists(xlsx_path):
        print(f"Error: File not found at {xlsx_path}")
        return False
        
    try:
        print(f"Parsing Excel file: {xlsx_path}...")
        with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
            # Read shared strings
            shared_strings = []
            try:
                with zip_ref.open('xl/sharedStrings.xml') as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    ns = {'ns': root.tag.split('}')[0].strip('{')} if '}' in root.tag else {}
                    
                    for si in root.findall('.//ns:si' if ns else './/si', ns):
                        t_elems = si.findall('.//ns:t' if ns else './/t', ns)
                        text = "".join(t.text for t in t_elems if t.text)
                        shared_strings.append(text)
            except KeyError:
                print("No shared strings found (could be an empty or simple file).")
                
            # Read sheet1
            with zip_ref.open('xl/worksheets/sheet1.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'ns': root.tag.split('}')[0].strip('{')} if '}' in root.tag else {}
                
                rows = {}
                for row_elem in root.findall('.//ns:row' if ns else './/row', ns):
                    r_num = int(row_elem.get('r'))
                    rows[r_num] = {}
                    for c_elem in row_elem.findall('.//ns:c' if ns else './/c', ns):
                        r_ref = c_elem.get('r')
                        col_letter = ''.join([char for char in r_ref if char.isalpha()])
                        
                        t_attr = c_elem.get('t')
                        val_elem = c_elem.find('ns:v' if ns else 'v', ns)
                        val = ""
                        if val_elem is not None:
                            val = val_elem.text
                            if t_attr == 's' and val:
                                idx = int(val)
                                if idx < len(shared_strings):
                                    val = shared_strings[idx]
                        rows[r_num][col_letter] = val
                        
        print("Excel parsing complete. Structuring data...")
        
        # Get filename without extension for bankName
        filename_without_ext = os.path.splitext(os.path.basename(xlsx_path))[0]
        
        # Output array starts with the bankName header item
        output_data = [{"bankName": filename_without_ext}]
        q_id = 1
        
        # Start reading from Row 3 (Row 1 and 2 are headers)
        sorted_row_nums = sorted(rows.keys())
        for r_num in sorted_row_nums:
            if r_num < 3:
                continue
                
            row_data = rows[r_num]
            
            # Column F contains the question content. If empty, skip.
            question_text = row_data.get('F', '').strip()
            if not question_text:
                continue
                
            # Parse correct answer. Column H is index 1, 2, 3, or 4.
            ans_str = row_data.get('H', '').strip()
            try:
                # Convert answer to 1-based integer index
                ans_val = int(float(ans_str))
            except ValueError:
                ans_val = ans_str # fallback to string if not an integer
                
            # Build options list
            options = []
            
            # Option 1: content in I, explanation in J
            opt1_text = row_data.get('I', '').strip()
            if opt1_text:
                options.append({
                    "id": 1,
                    "text": opt1_text,
                    "explanation": row_data.get('J', '').strip()
                })
                
            # Option 2: content in K, explanation in L
            opt2_text = row_data.get('K', '').strip()
            if opt2_text:
                options.append({
                    "id": 2,
                    "text": opt2_text,
                    "explanation": row_data.get('L', '').strip()
                })
                
            # Option 3: content in M, explanation in N
            opt3_text = row_data.get('M', '').strip()
            if opt3_text:
                options.append({
                    "id": 3,
                    "text": opt3_text,
                    "explanation": row_data.get('N', '').strip()
                })
                
            # Option 4: content in O, explanation in P
            opt4_text = row_data.get('O', '').strip()
            if opt4_text:
                options.append({
                    "id": 4,
                    "text": opt4_text,
                    "explanation": row_data.get('P', '').strip()
                })
                
            q_type = row_data.get('C', '').strip()
            if not q_type:
                q_type = "MulChoice"
                
            question_obj = {
                "id": q_id,
                "code": row_data.get('A', '').strip(),
                "type": q_type,
                "question": question_text,
                "explanation": row_data.get('G', '').strip(),
                "answer": ans_val,
                "options": options
            }
            
            output_data.append(question_obj)
            q_id += 1
            
        # Write questions to JSON file
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully converted {len(output_data) - 1} questions!")
        print(f"JSON file saved to: {json_path}")
        return True
        
    except Exception as e:
        print(f"Error converting file: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # If a path argument is provided, process that single file
    if len(sys.argv) > 1:
        xlsx_path = sys.argv[1]
        if len(sys.argv) > 2:
            json_path = sys.argv[2]
        else:
            base, _ = os.path.splitext(xlsx_path)
            json_path = base + ".json"
        convert_xlsx_to_json(xlsx_path, json_path)
    else:
        # Otherwise, scan the question_bank directory for all xlsx files
        qb_dir = "question_bank"
        if not os.path.exists(qb_dir):
            print(f"Directory '{qb_dir}' not found. Using current working directory...")
            qb_dir = "."
            
        files = [f for f in os.listdir(qb_dir) if f.endswith(".xlsx")]
        if not files:
            print(f"No .xlsx files found in '{qb_dir}' directory.")
        else:
            print(f"Found {len(files)} Excel files in '{qb_dir}'. Converting all...")
            for f in files:
                xlsx_path = os.path.join(qb_dir, f)
                json_path = os.path.join(qb_dir, os.path.splitext(f)[0] + ".json")
                convert_xlsx_to_json(xlsx_path, json_path)

