import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  VStack,
  ModalFooter,
  Button,
  Tag,
  Image,
  Text,
  Link,
} from "@chakra-ui/react";

const BASE_URL = "https://backoffice.rnt.co.th/uploads/";

// Function to check if the file is an image
const isImage = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
  const ext = filename.split(".").pop().toLowerCase();
  return imageExtensions.includes(ext);
};

const HistoryModal = ({ isOpen, onClose, data = [] }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent style={{ maxWidth: "80%" }}>
        <ModalHeader>Lock Reserve History</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {data.length > 0 ? (
            <TableContainer>
              <Table variant="striped" colorScheme="gray" size="sm">
                <Thead>
                  <Tr>
                    <Th>Contract Name</Th>
                    <Th>Status</Th>
                    <Th>Created At</Th>
                    <Th>Attachments</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((reserve) => (
                    <Tr key={reserve.id}>
                      <Td>{reserve.contract_name}</Td>
                      <Td>
                        <Tag colorScheme="blue">{reserve.status}</Tag>
                      </Td>
                      <Td>{new Date(reserve.created_at).toLocaleString()}</Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          {reserve.attachments.map((attachment) =>
                            isImage(attachment.filename) ? (
                              <Image
                                key={attachment.id}
                                src={`${BASE_URL}${attachment.filename}`}
                                alt={attachment.filename}
                                boxSize="100px"
                                objectFit="contain"
                              />
                            ) : (
                              <Link
                                key={attachment.id}
                                href={`${BASE_URL}${attachment.filename}`}
                                download={attachment.filename}
                                color="blue.500"
                                isExternal
                              >
                                {attachment.filename}
                              </Link>
                            )
                          )}
                        </VStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text>No history available for this lock.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HistoryModal;
