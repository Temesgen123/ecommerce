declare module 'sib-api-v3-sdk' {
  class ApiClient {
    static instance: ApiClient;
    authentications: Record<string, { apiKey: string }>;
  }

  class ContactsApi {
    createContact(contact: {
      email: string;
      listIds?: number[];
      updateEnabled?: boolean;
      attributes?: Record<string, string>;
    }): Promise<any>;

    removeContactFromList(
      listId: number,
      body: { emails: string[] },
    ): Promise<any>;
  }

  export default { ApiClient, ContactsApi };
}
