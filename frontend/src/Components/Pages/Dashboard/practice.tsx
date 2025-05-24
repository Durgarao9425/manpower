import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Checkbox, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, Grid, Heading, HStack, IconButton, Input, List, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, Table, TableCaption, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Text, Textarea, Tfoot, Th, Thead, Tr, UnorderedList, useDisclosure, } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {  useForm } from "react-hook-form";
import DoctypeDto from "@shared/Model/FrappeDataImportDto";
import { SOMETHING_WRONG } from "@shared/allMsgs";
import useToaster from "@shared/Hooks/useToastr";
import { isEmpty } from "@shared/globalFunctions"; 
import Loader from "@shared/Components/Loader/Loader";
import { useCustomFrappeCreateDoc, useCustomFrappeGetDocList, useCustomFrappeUpdateDoc, } from "@shared/Hooks/useFrappeDoc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faInfoCircle, faPaperclip, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useFrappeHookCallService } from "@shared/Hooks/useFrappeHookCallService";
import {  useFrappeFileUpload } from "frappe-react-sdk";

function FrappeDataImportForm(props) {
  const NameOfDoctype = "Data Import";
  const [DoctypeList, setDoctypeList] = useState([]);
  const [fields, setFields] = useState([]);
  const [dataImportName, setDataImportName] = useState(null);
  const [selectedValue, setSelectedValue] = useState(`${props?.selectedEmpId ? props?.selectedEmpId : ""}`);
  const [selectedFiletype, setSelectedFiletype] = useState('CSV');
  const [selectedExporttype, setSelectedExporttype] = useState('blank_template');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [FileUrlForExport, setFileUrlForExport] = useState("");
  const [previewColumnsData,setPreviewColumnsData] = useState([]);
  const [PreviewRowData,setPreviewRowData] = useState([]);
  const [PreviewWarnings,setPreviewWarnings] = useState([]);
  const [previewShown, setPreviewShown] = useState(false);
  const btnRef = useRef();
 
  const { isOpen:isOpen2, onOpen: onOpen2, onClose:onClose2 } = useDisclosure();
  
  const { data: RoleListQuery, isLoading: isLoadRoleListQuery, error: isErrRoleListQuery, } = useCustomFrappeGetDocList("Role Profile", {
    fields: ["name"],
    filters: [],
    limit: 999,
    orderBy: {
        field: "creation",
        order: "desc",
    },
});

const { data: ShiftListQuery, isLoading: isLoadShiftListQuery, error: isErrShiftListQuery, } = useCustomFrappeGetDocList("Shift Type", {
  fields: ["name", "shift_name",],
  filters: [],
  limit: 999,
  orderBy: {
      field: "creation",
      order: "desc",
  },
});

const { data: BranchListQuery, isLoading: isLoadBranchListQuery, error: isErrBranchListQuery, } = useCustomFrappeGetDocList("Branch", {
  fields: ["name", 'branch'],
  filters: [],
  limit: 999,
  orderBy: {
      field: "creation",
      order: "desc",
  },
});

const { data: academicYearQueryListData, mutate: mutateAcademicYear } = useCustomFrappeGetDocList('Academic Year', {
  fields: ['name'],
  limit: 999,
  orderBy: {
      field: 'creation',
      order: 'desc',
  },
});

const { data: GradeQuery, mutate: mutateGradeQuery } = useCustomFrappeGetDocList('Program', {
  fields: ['*'],
  limit: 999,
  orderBy: {
      field: 'creation',
      order: 'desc',
  },
});

const { data: classListQueryData, isLoading: isLoadingClassList, error: errorClassList, mutate: mutateClassList } = useCustomFrappeGetDocList<any>('Student Group', {
  fields: ['name'],
  limit: 999,
  orderBy: {
      field: 'creation',
      order: 'desc',
  },
});

const AccordionData = [
  {title: 'Employee',
    children:  [
    { title: 'Role', description: RoleListQuery?.map((item) => item?.name) },
    { title: 'Date of Joining', description: ['YYYY-MM-DD', 'DD-MM-YYYY'], Note:"Please enter the date in one of the formats mentioned above." },
    { title: 'Date of Birth', description: ['YYYY-MM-DD', 'DD-MM-YYYY'], Note:"Please enter the date in one of the formats mentioned above." },
    { title: 'Gender', description: ['Male', 'Female'] },
    { title: 'Default Shift', description: ShiftListQuery?.map((item) => item?.name) },
    { title: 'Home Branch', description: BranchListQuery?.map((item) => item?.name) },
]
  },
  {title: 'Student',
    children: [
    { title: 'Grade', description: GradeQuery?.map((item) => item?.name) },
    { title: 'Academic Year', description: academicYearQueryListData?.map((item) => item?.name) },
    { title: 'Enrollment Date', description: ['YYYY-MM-DD', 'DD-MM-YYYY'], Note:"Please enter the date in one of the formats mentioned above." },
    { title: 'Student Group', description: classListQueryData?.map((item) => item?.name) },
    { title: 'Joining Date', description: ['YYYY-MM-DD', 'DD-MM-YYYY'], Note:"Please enter the date in one of the formats mentioned above." },
    { title: 'Gender', description: ['Male', 'Female'] },
    { title: 'Date of Birth', description: ['YYYY-MM-DD', 'DD-MM-YYYY'], Note:"Please enter the date in one of the formats mentioned above." },
  ]
  },
]

  useEffect(() => {
    if (fields?.length > 0) {
      setSelectedFields(fields?.filter(item => item?.reqd === 1)?.map(item => item?.fieldname));
    }
  }, [fields]);
  
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if(event.target.value){
        clearErrors('reference_doctype')
    }
  };

  const handleFileTypeChange = (event) => {
    setSelectedFiletype(event.target.value);
  };
  const handleExportTypeChange = (event) => {
    setSelectedExporttype(event.target.value);
  };
  
  const [selectedFields, setSelectedFields] = useState(() =>
    fields?.map(item => (item?.reqd === 1 ? item?.fieldname : null))?.filter(Boolean)
  );

  const isDefaultSelected = selectedFields?.length > 0 && selectedFields?.every(fieldname => 
    fields?.find(item => item?.fieldname === fieldname && item?.reqd === 1)
  );

  const handleSelectAll = () => {
    setSelectedFields(fields?.map(item => item?.fieldname));
  };

  const handleUnselectAll = () => {
    setSelectedFields([]);
  };

  const handleDefaultSelectAllMandatory = () => {
    setSelectedFields(fields?.map(item => (item?.reqd === 1 ? item?.fieldname : null))?.filter(Boolean));
  };

  const handleCheckboxChange = (fieldname) => {
    setSelectedFields(prevSelectedFields =>
      prevSelectedFields?.includes(fieldname)
        ? prevSelectedFields?.filter(item => item !== fieldname)
        : [...prevSelectedFields, fieldname]
    );
  };

  const isAllSelected = selectedFields.length === fields.length;
  const isNoneSelected = selectedFields.length === 0;

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
    setPreviewRowData([]);
    setPreviewColumnsData([]);
    setPreviewWarnings([]);
    setPreviewShown(false);


  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files as FileList);

    const csvFiles = files?.filter(file => file?.name?.endsWith(".csv"));

    if (csvFiles.length < files.length) {
        alert("Only CSV files are allowed. Please upload csv file only");
    }

    setAttachments([...attachments, ...csvFiles]);

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
};

  
  const fileInputRef = useRef<HTMLInputElement>(null);

//   console.log("fileInputRef", fileInputRef);
//   console.log("attacjees", attachments);
//   console.log("attacjees", attachments.length);
  

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const { register, handleSubmit, control, formState: { errors }, setValue, setError, clearErrors, getValues, watch, setFocus, } = useForm<DoctypeDto>();
  const { upload, progress, loading: fileUploading } = useFrappeFileUpload();
  const { createDoc, loading: isLoadingWhileCreation, error: errorWhileCreation, isCompleted: isCompletedWhileCreation, reset: handleResetWhileCreation, } = useCustomFrappeCreateDoc();
  const { updateDoc, loading: isLoadingWhileUpdating, error: errorWhileUpdating, isCompleted: isCompletedWhileUpdating, reset: handleResetWhileUpdating, } = useCustomFrappeUpdateDoc();
  const toasterService = useToaster();
  const frappeHookCallService = useFrappeHookCallService();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: DoctypeDto) => {
    data.reference_doctype=selectedValue
    data.import_type="Insert New Records";
    data.mute_emails="1";
    callSubmitApi(data);
  };
  
  const forDowloadTemplatePress = async () => {
    try {
      const checklistData = await frappeHookCallService.frappeDeskFormLoadGetdoctype(selectedValue);
    //   console.log("frappe.desk.form.load.getdoctype", checklistData);

      if (checklistData && checklistData.docs) {
          const docs = checklistData.docs;
          // console.log("Docs:", docs);
          const erased = docs.find(obj => obj.name === selectedValue);
          // console.log("Erased:", erased);

          if (erased) {
              const fields = erased.fields;
            //   console.log("Fields:", fields);
              const filteredFields = fields.filter(field =>
                  !["Section Break", "Column Break", "Tab Break", "HTML", "Table", "Table MultiSelect", "Button", "Image", "Fold", "Heading"].includes(field.fieldtype) &&
                  !["lft", "rgt",'status', 'company','naming_series'].includes(field.fieldname) &&
                  !field.is_virtual
              );

            //   console.log("Filtered Fields:", filteredFields);
              setFields(filteredFields);
              onOpen();
          } else {
              console.error("No document with name 'Employee' found in docs.");
          }
      } else {
          console.error("checklistData or checklistData.docs is undefined");
      }
  } catch (error) {
      console.error("Error fetching checklist data:", error);
  }
  }

  function callSubmitApi(data: DoctypeDto) {
    setIsLoading(true);
    let postParams: any = {};
    postParams = data;

    if (!isEmpty(props?.selectedEmpId)) {
      postParams.name = props?.selectedEmpId;
      // onUpdateApiCall(postParams);
    } else {
      onCreateApiCall(postParams);
    }
  }

  async function onCreateApiCall(postParams) {
    try {
        const response = await createDoc(NameOfDoctype, postParams);
        setIsLoading(false);

        if (response && response.reference_doctype) {
           setDataImportName(response.name)
            // toasterService.showSuccessMessage(`${NameOfDoctype} created successfully`, "");

            if (!isEmpty(response)) {
                setIsLoading(false);
                toasterService.showSuccessMessage('Saved successfully', '');

                try {
                    const checklistData = await frappeHookCallService.frappeDeskFormLoadGetdoctype(selectedValue);
                    // console.log("frappe.desk.form.load.getdoctype", checklistData);

                    if (checklistData && checklistData.docs) {
                        const docs = checklistData.docs;
                        // console.log("Docs:", docs);

                        const erased = docs.find(obj => obj.name === selectedValue);
                        // console.log("Erased:", erased);

                        if (erased) {
                            const fields = erased.fields;
                            console.log("Fields:", fields);
                            const filteredFields = fields.filter(field =>
                                !["Section Break", "Column Break", "Tab Break", "HTML", "Table", "Table MultiSelect", "Button", "Image", "Fold", "Heading"].includes(field.fieldtype) &&
                                !["lft", "rgt"].includes(field.fieldname) &&
                                !field.is_virtual
                            );

                            // console.log("Filtered Fields:", filteredFields);
                            setFields(filteredFields);
                        } else {
                            console.error("No document with name 'Employee' found in docs.");
                        }
                    } else {
                        console.error("checklistData or checklistData.docs is undefined");
                    }
                } catch (error) {
                    console.error("Error fetching checklist data:", error);
                }

                // props.onBkClk();
            }
            // props.onBkClk();
        } else {
            toasterService.showErrorMessage(SOMETHING_WRONG);
        }
    } catch (errorObject:any) {
        setIsLoading(false);
        let server_messages = JSON.parse(errorObject._server_messages);
        let errObject = JSON.parse(server_messages[0]);
        toasterService.showErrorMessage(errObject.message);
    }
}

const handleExport = async () => {
  try {
    const ExportFields = {
      [selectedValue]: selectedFields
    };

    console.log("Selected Fields", ExportFields);

    const ExportData = {
      doctype: selectedValue,
      file_type: selectedFiletype,
      export_records: selectedExporttype,
      export_fields: JSON.stringify(ExportFields),
      export_filters: null
    };

    const response = await frappeHookCallService.frappeExportData(ExportData);
    // console.log("API Response:", response);
    // console.log("Response Type:", typeof response);
    if (response instanceof Blob) {
    //   console.log("Response is a Blob");
    } else {
    //   console.log("Response is not a Blob");
    }

    let blob;
    let fileExtension;
    let mimeType;

    if (selectedFiletype === 'CSV') {
      fileExtension = 'csv';
      mimeType = 'text/csv';

      blob = new Blob([response], { type: mimeType });
    } else if (selectedFiletype === 'Excel') {
      fileExtension = 'xlsx';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (response instanceof Blob) {
        blob = response;
      } else {
        blob = new Blob([response], { type: mimeType });
      }
    } else {
      throw new Error("Unsupported file type selected");
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${selectedValue}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error exporting data:", error);
  }
};

const UploadFile = async () => {
  setIsLoading(true);
  try {
    if (attachments.length > 0) {
      await Promise.all(
        attachments.map(async (file) => {
          const uploadData = {
            isPrivate: true,
            doctype: "Data Import",
            docname: dataImportName,
            fieldname:"import_file"
          };

         const fileUploadResponse =  await upload(file, uploadData);
          // console.log("File Uploaded:", fileUploadResponse.file_url);
          const FileUrlForExport = await fileUploadResponse.file_url;
          await setFileUrlForExport(FileUrlForExport)
          // console.log("File123", FileUrlForExport);

          const forPrieview = await {
            data_import:dataImportName,
            import_file: FileUrlForExport    
          }    

            try{
              const PreviewData = await frappeHookCallService.getPreviewFromTemplatertData(forPrieview);
              // console.log("Preview Respone", PreviewData);
              setPreviewColumnsData(PreviewData.message.columns);
              setPreviewShown(true);
              setPreviewRowData(PreviewData.message.data); 
              setPreviewWarnings(PreviewData.message.warnings); 
              setIsLoading(false);
            }
            catch (errorObject:any) {
              setIsLoading(false);
              let server_messages = JSON.parse(errorObject._server_messages);
              let errObject = JSON.parse(server_messages[0]);
              toasterService.showErrorMessage(errObject.message);
          }


const data = {import_file : FileUrlForExport}
  await updateDoc(NameOfDoctype, dataImportName + "", data).then(
    (response) => {
      setIsLoading(false);
      if (response) {
        toasterService.showSuccessMessage( `File uploaded successfully`, "" );
        // props.onBkClk();
        // setSelectedDocName("0");
      } else {
        toasterService.showErrorMessage(SOMETHING_WRONG);
      }
    },
    (errorObject) => {
      setIsLoading(false);

      let server_messages = JSON.parse(errorObject._server_messages);
      let errObject = JSON.parse(server_messages[0]);
      toasterService.showErrorMessage(errObject.message);
    }
  );
         
        })
      );
      // console.log("All files uploaded successfully.");    
      
    } else {
      // console.log("No files to upload.");
    }

  } catch (error) {
    // console.error("Error creating document:", error);
    throw error;
  }
};


async function onUpdateApiCall() {
  const data = {import_file : FileUrlForExport}
  await updateDoc(NameOfDoctype, dataImportName + "", data).then(
    (response) => {
      setIsLoading(false);
      if (response) {
        toasterService.showSuccessMessage(
          `${NameOfDoctype} updated successfully`,
          ""
        );
        // props.onBkClk();
        // setSelectedDocName("0");
      } else {
        toasterService.showErrorMessage(SOMETHING_WRONG);
      }
    },
    (errorObject) => {
      setIsLoading(false);

      let server_messages = JSON.parse(errorObject._server_messages);
      let errObject = JSON.parse(server_messages[0]);
      toasterService.showErrorMessage(errObject.message);
    }
  );
}

async function StartImport() {
  try {
      const startImportData = {data_import:dataImportName}
      props.onBkClk();
      toasterService.showInfoMessage(`Data Import Started successfully, Please check status after some time`, "");
      const response = await await frappeHookCallService.startImport(startImportData);
      // if (response && response.reference_doctype) {
      //     toasterService.showSuccessMessage(`Data Import Started successfully, Please chack status after some time`, "");
      // } else {
      //     toasterService.showErrorMessage(SOMETHING_WRONG);
      // }
  } 
  catch (errorObject:any) {
      // setIsLoading(false);
      // let server_messages = JSON.parse(errorObject._server_messages);
      // let errObject = JSON.parse(server_messages[0]);
      // toasterService.showErrorMessage(errObject.message);
  }
}

const listofDoctypes = async() => {
  const forDoctypes = await {
    txt:'',
    doctype:"DocType",
    page_length:10,
    ignore_user_permissions:0,
    filters:{"name":["in",["Opportunity","Shift Request","Budget","Employee Checkin","Shipping Rule","Asset","Employment Type","Account","Payment Entry","Lead","Asset Category","Sales Order","Training Event","Employee","Quotation","Pricing Rule","Web Profile","Error Log","Data Import","Leave Allocation","Salary Structure","Journal Entry","Campaign","Department","Job Offer","Attendance","Bank Account"]]}
  } 
  
  try{              
    const DoctypeData = await frappeHookCallService.search_Search_Link(forDoctypes);
    console.log("Doctype List", DoctypeData);
    setDoctypeList(DoctypeData.message);
  }
  catch (errorObject:any) {
    setIsLoading(false);
    let server_messages = JSON.parse(errorObject._server_messages);
    let errObject = JSON.parse(server_messages[0]);
    toasterService.showErrorMessage(errObject.message);
}
}

useEffect(()=>{
  listofDoctypes();

},[])
  return (
    <>
      {isLoading && <Loader isLoading={isLoading} />}

      <Box >
        <Box >
        <Box p={4} display={{ base: "block" }} >
        <Box>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" >
           
            <Grid mb={2} templateColumns={{ base: "1fr", md: "1fr", lg: "1fr 1fr", xl: "repeat(2,1fr)", }} gap={1} py={1} >
               
                <FormControl>
                
                <FormLabel fontWeight={"400"} fontSize={"sm"}> Document Type <span className="text-danger">*</span> </FormLabel>

                <Select maxW={320} placeholder="Select" {...register("reference_doctype", { required: true })}
                    value={selectedValue}
                    onChange={handleChange}
                    disabled={dataImportName}
                >
                    <option value={'Employee'}>Employee</option>
                    <option value={'Student'}>Student</option>
                    {/* <option>Branch</option> */}
                </Select>
                {/* <Select maxW={320} placeholder="Select" {...register("reference_doctype", { required: true })}
                //  value={selectedValue}
                    value={`${props?.selectedEmpId ? props?.selectedEmpId : selectedValue}`}
                    onChange={handleChange}
                    disabled={dataImportName}
                >
                {(DoctypeList?.length > 0) && DoctypeList?.map((obj, index) => {
                            return (<option key={(index + 1)} value={obj?.value}>{obj?.value}</option>)
                        })}
                </Select> */}
            {errors.reference_doctype && <Text fontSize={'xs'} color="red">Document Type is required</Text>}
            {/* <Text p={2} fontWeight={"bold"}>{dataImportName}</Text>  */}
                </FormControl> 
                {/* <Button maxW={240} mt={7} ml={8} size={"md"} bg="#cfe2ff" color={"#052c65"} _hover={{bg:"#cfe2ff",color:"#052c65"}} onClick={listofDoctypes}>Get List</Button> */}

            {
            selectedValue ?
            (
            <Box>
            <Button maxW={240} mt={7} ml={2} size={"md"} bg="#cfe2ff" color={"#052c65"} _hover={{bg:"#cfe2ff",color:"#052c65"}} onClick={forDowloadTemplatePress}>Download Template</Button>
            <Box mt={2}>
            <IconButton aria-label="CSV Info" color={"#275288"} icon={<FontAwesomeIcon icon={faInfoCircle} />} size="xs" m={1} ref={btnRef} onClick={onOpen2} /><Text as={'span'} color={'gray.500'}>Note: Please refer before filling the CSV to avoid inconsistency.</Text>
            </Box>
            </Box>
            
            ): ""}                  
                </Grid>

            <hr />

            <Flex className="offset-6 col-6 text-end" justify="flex-end" mr="10px" my={3} >
                {dataImportName ? ""
                : ( <Button type="submit" className="btn-success">
                {props?.selectedEmpId == 0 ? "Proceed to Next" : "Update"}
            </Button>)                           
            }
            </Flex>
            </form>
        </Box>
        </Box>
        
        </Box>

           
            <Box p={4} mt={-10}>
             
              {/* {dataImportName ?
                
                (<Button size={"md"} bg="#cfe2ff" color={"#052c65"} _hover={{bg:"#cfe2ff",color:"#052c65"}} onClick={onOpen}>Download Template</Button>
                  
                ) : ""
              } */}

            {/* {
            selectedValue ?
            (<Button size={"md"} bg="#cfe2ff" color={"#052c65"} _hover={{bg:"#cfe2ff",color:"#052c65"}} onClick={forDowloadTemplatePress}>Download Template</Button>
            ): ""} */}


            <FormControl  mt={2}>
                  { dataImportName && attachments?.length === 0 ? 
                            (
                            <>
                  <FormLabel fontWeight={"400"} fontSize={"sm"}>
                  Import File
                            </FormLabel>
                            <Button onClick={openFileDialog} mb={2} fontWeight={500} backgroundColor="rgb(255, 230, 156)">
                              <FontAwesomeIcon icon={faPaperclip} style={{ marginRight: "5px" }} />
                              Attach File
                            </Button>  
                <Box><Text m={1} color={'#646464'} fontSize={'xs'}>File Type Allowed: {"CSV"} </Text></Box>

                            </>) : ""   
                }
                            <input
                              ref={fileInputRef}
                              type="file"
                              // multiple
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                             accept=".csv"
                            />
                            
                            <Flex mt={4} justify={'flex-start'}>
                             
                              {attachments?.map((file, index) => (
                                <Box key={index} mb={2}>
                                   <Text fontWeight={400} fontSize={'md'}>Attachments</Text>
                                  <Flex justify="space-between" alignItems="center">
                                    <span style={{ display: "inline-block", width: "240px", fontWeight:"500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }} >
                                      {file?.name}
                                    </span>
                                    <IconButton size={"xs"} colorScheme="red" aria-label="Delete" w={"2%"} icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleRemoveAttachment(index)} >
                                      &nbsp; &nbsp; X &nbsp; &nbsp;
                                    </IconButton>
                                  </Flex>
                                </Box>
                              ))}
                            </Flex>
                          </FormControl>
            
            </Box>
            <Box>
          
            {attachments?.length === 1 && !previewShown ? 
            (
              <Flex justify={"flex-end"}>
                <Button m={5} bg="#cfe2ff" color={"#052c65"} _hover={{bg:"#cfe2ff",color:"#052c65"}}  onClick={!isLoading ? UploadFile : null} isDisabled={isLoading}>{isLoading ? "Loading" : 'Upload and Preview'}</Button>
              </Flex>
            )
          
            : "" }
            </Box>  
            <Box>           
            <Box p={5}>
              {previewColumnsData?.length > 0 ? 
              (<Text mb={2} fontWeight={"600"} fontSize={"lg"} px={1} pt={3}>Preview</Text>                   
              ): ""
              }
            <TableContainer borderRadius={10}>
                  <Table variant='striped' colorScheme='teal' borderRadius={10}>
                    <Thead>
                    <Tr>
                          {previewColumnsData?.map((column, index) => (
                            <Th 
                              key={index} 
                              color={index === 0 ? 'inherit' : (column?.skip_import ? "#b52a2a" : "#16794c")}
                            >
                              {column?.header_title}({index+1})
                            </Th>
                          ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                      {PreviewRowData?.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                          {row?.map((cell, cellIndex) => (
                             <Td key={cellIndex}>{cell}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
           
            </Box>

           
            <Box px={5}>
            {PreviewWarnings?.length > 0 ? 
              (<Text mb={2} fontWeight={"600"} fontSize={"lg"} pt={3}>Import Logs and Warnings</Text>                   
              ): ""
              }
              {PreviewWarnings?.length > 0 && PreviewWarnings?.map((item, index) => (
                                <>
              <Text my={2} fontSize={"md"} fontWeight={600}>Column: {Number(item?.col) + 1}</Text>
              <Text fontSize={'sm'}>{item?.message} </Text>
                </>
                
                ))}
            </Box>
            <Box>

           
            {PreviewRowData?.length > 0 ? (
              <Box m={5}>
              <Button className="btn-success" float={'right'} m={5} onClick={StartImport}>Start Import</Button>
              </Box>

            ) : ""
            
            }
            </Box>
            </Box>

            <Box>
            <Modal isOpen={isOpen} onClose={onClose} size={"xl"} scrollBehavior={'inside'} >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader borderBottom={"0.5px solid #ddd"} fontWeight={600} fontSize={'md'}>Export Data</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <FormControl>
                    <FormLabel fontWeight={"400"} fontSize={"sm"}>
                      File Type
                    </FormLabel>
                    <Select disabled
                    // placeholder="Select" 
                    // {...register("file_type")}
                      value={selectedFiletype}
                      onChange={handleFileTypeChange}
                      defaultValue={"CSV"}
                    >
                      <option selected >CSV</option>
                      {/* <option>Excel</option> */}
                    </Select>
                  </FormControl>
                  
                <FormControl>
                    <FormLabel fontWeight={"400"} fontSize={"sm"} mt={2}>
                    Export Type
                    </FormLabel>
                    <Select 
                      value={selectedExporttype}
                      onChange={handleExportTypeChange}
                      defaultValue={"blank_template"}
                    >
                      <option value="blank_template">Blank Template</option>
                      <option value="all">All Record</option>
                      <option value="5_records">5 Records</option>
                    </Select>
                  </FormControl>
                <Text my={1} fontWeight={"400"} fontSize={"sm"} px={1} pt={3}>Select Fields To Insert</Text>                   
                <Box>

      <Box mb={4}>
        <Button size={"sm"} onClick={handleSelectAll} mr={2} colorScheme={isAllSelected ? 'green' : 'gray'} >
          Select All
        </Button>
        <Button size={"sm"} onClick={handleUnselectAll} mr={2} colorScheme={isNoneSelected ? 'green' : 'gray'} >
          Unselect All
        </Button>
        <Button size={"sm"} onClick={handleDefaultSelectAllMandatory} colorScheme={isDefaultSelected && !isAllSelected ? 'green' : 'gray'} >
          Select All Mandatory
        </Button>
      </Box>

      <Grid templateColumns={{ base: '1fr 1fr', md: '1fr 1fr' }} gap={1} px={2} pb={1}>
        {fields?.map((item, index) => (
          <Checkbox
            fontSize={'xs'}
            key={index}
            value={item?.fieldname}
            color={item?.reqd === 1 ? 'red' : 'inherit'}
            isChecked={selectedFields?.includes(item?.fieldname)}
            onChange={() => handleCheckboxChange(item?.fieldname)}
          >
            {item?.label}
          </Checkbox>
        ))}
      </Grid>
    </Box>
                </ModalBody>

                <ModalFooter borderTop={"0.5px solid #ddd"}>
                
                  {
                    selectedFields?.length > 0 ?
                    (
                  <Button colorScheme='blue' size={'sm'} mr={3} className="btn-success" onClick={handleExport}>
                    Export
                  </Button>

                    ) : (
                      <Flex align="center">
                        <FontAwesomeIcon color="red" icon={faExclamationTriangle} style={{ marginRight: '5px' }} />
                        <Text>Select at least one field to Export</Text>
                      </Flex>
                    )
                  }
                </ModalFooter>
              </ModalContent>
            </Modal>
            </Box>


            <Drawer size={"sm"} isOpen={isOpen2} placement='right' onClose={onClose2} finalFocusRef={btnRef}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader ml={-2}>Data Filling Guidance</DrawerHeader>

                <DrawerBody px={0}>
                  <Accordion allowToggle>
                    {AccordionData?.map((parentItem, parentIndex) => (
                      <AccordionItem key={parentIndex + 1}>
                        <AccordionButton>
                          <Box as='span' flex='1' textAlign='left'>
                            <Text>{parentItem?.title}</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel pb={4}>
                          {parentItem?.children?.map((childItem, childIndex) => (
                            <Accordion key={childIndex} allowToggle bg={'#e4e8f0'}>
                              <AccordionItem>
                                <AccordionButton>
                                  <Box as='span' flex='1' textAlign='left'>
                                    <Text>{childItem?.title}</Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>

                                <AccordionPanel pb={4}>
                                  <UnorderedList pl={2}>
                                    {childItem?.description?.map((li, ind) => (
                                      <ListItem key={ind}>
                                        <Text>{li}</Text>
                                      </ListItem>
                                    ))}
                                  </UnorderedList>
                                  {childItem?.Note && <Text mt={1}><b>Note:</b> {childItem?.Note}</Text>}
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </DrawerBody>
              </DrawerContent>
            </Drawer>

     </Box>
    </>
  );
}

export default FrappeDataImportForm;
