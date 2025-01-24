from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import random,re,time,os,ast,sys,json

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("start-maximized")
chrome_options.add_argument("--window-size=1920x1080")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")

# Input Clean Function
def return_clean(input):
    input += ','
    clean_input = []
    i = 0
    while(i < len(input)):
        ch = input[i]
        if(ch != '='):
            # Proceed
            i += 1
        else:
            # Skip space
            i += 2

            str11 = ""
            if(input[i] == '['): # Array is present
                i += 1
                while(input[i] != ']'):
                    str11 += input[i]
                    i += 1
                str11 = str11.split(',')
                array_length = len(str11)
                str12 = [str(array_length)]
                str12.extend(str11)
                clean_input.append(" ".join(map(str, str12)))
            else:
                while(input[i]!=','):
                    str11 += input[i]
                    i += 1
                clean_input.append(str11)
            i += 1
    clean_input = " ".join(map(str, clean_input))
    return clean_input

def find_dimensions(array):
    # Base case: If the array is not a list, return an empty dimension
    if not isinstance(array, list) or (not array):
        return []
    # Recursive case: Get the length of the current dimension and recurse deeper
    return [len(array)] + find_dimensions(array[0])

def flatten_list(nested_list):
    # Base case: If the element is not a list, yield it
    for element in nested_list:
        if isinstance(element, list):
            yield from flatten_list(element)
        else:
            yield element

def return_clean(input):
    input += ','
    clean_input = []
    i = 0
    while(i < len(input)):
        ch = input[i]
        if(ch != '='):
            # Proceed
            i += 1
        else:
            # Skip space
            i += 2

            str11 = ""
            ndim = 0
            while(input[i]=='['):
                i += 1
                ndim += 1
            if(ndim != 0): # Array is present
                i -= ndim
                str11 = ""
                closingBrackets = ']' * ndim
                while(input[i:i+ndim] != closingBrackets):
                    str11 += input[i]
                    i += 1
                str11 += ']'*ndim
                arr = ast.literal_eval(str11)
                # print(arr)
                dim_matrix = find_dimensions(arr)
                assert(len(dim_matrix)==ndim or (not dim_matrix and ndim==1))
                resultant_matrix = " ".join(map(str, dim_matrix)) + " " + " ".join(map(str, flatten_list(arr)))
                clean_input.append(resultant_matrix)
            else:
                if(input[i]=='"'):
                    i += 1
                    while(input[i]!='"'):
                        str11 += input[i]
                        i += 1
                else:
                    while(input[i]!=','):
                        str11 += input[i]
                        i += 1
                clean_input.append(str11)
            i += 1
    clean_input = " ".join(map(str, clean_input))
    return clean_input

# Get Problem Name
def getProblemName(url):
    url = url[8:]
    url = url.split('/')
    idx = -1
    for i,ele in enumerate(url):
        if(ele == 'problems'):
            idx = i+1
            break
    assert(idx != -1)
    return url[idx]

# Get Input worthy test cases
def extract_test_cases(soup):
    pre_tags = soup.find_all('pre')  # Find all <pre> tags
    final_processor = 69
    if pre_tags:
        final_processor = pre_tags
    else:
        final_processor = soup.find_all('div',class_="example-block")

    formatted_input = []
    formatted_output = []

    for tag in final_processor:
        text = tag.get_text(separator=" ").strip()
        cleaned_text = re.sub(r"(Input:|Output:|Explanation:)\s*", "", text)
        splitted_clean_text = cleaned_text.split('\n')

        # Get i/p and o/p
        input = splitted_clean_text[0]
        expected_output = splitted_clean_text[1][1:]

        # Convert output to clean form
        if(expected_output[0]=='"'):
            i = 1
            st = ""
            while(expected_output[i]!='"'):
                st += expected_output[i]
                i += 1
            formatted_output.append(st)
        elif(expected_output[0]=='['):
            # Convert string to array using ast.literal_eval
            expected_output = ast.literal_eval(expected_output)

            # find dim of list
            dim_array = find_dimensions(expected_output)

            # Convert each sub-array to a space-separated string and join them with newlines
            if(len(dim_array)>1):
                expected_output = "\n".join(" ".join(map(str, sub_array)) for sub_array in expected_output)
            else:
                expected_output = " ".join(map(str, expected_output))
            formatted_output.append(expected_output)
        else:
            formatted_output.append(expected_output)

        # Convert input to clean form ans append to 'formatted_input' list
        formatted_input.append(return_clean(input))
            
    return formatted_input,formatted_output


# Set up WebDriver
service = Service()
driver = webdriver.Chrome(service=service,options=chrome_options)

def main():
    try:
        url = sys.stdin.read()

        # Fetch problem Name
        problemName = getProblemName(url)

        driver.get(url)

        # Wait for the page to fully load
        time.sleep(random.uniform(4,5))

        # Get the page source (HTML content)
        html_content = driver.page_source
        # print("Successfully fetched HTML!")

        soup = BeautifulSoup(html_content,'lxml')

        # Extract test cases from brewed soup
        formatted_input,formatted_output = extract_test_cases(soup)

        assert(len(formatted_input) == len(formatted_output))
        result = {"message": "Hello from Python", "output": [formatted_input,formatted_output]}
        
        # Output result back to Node.js
        print(json.dumps(result))

    finally:
        driver.quit()

if __name__ == '__main__':
    main()