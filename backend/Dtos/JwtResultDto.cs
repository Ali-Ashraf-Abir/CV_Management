namespace backend.Dtos;
public class JwtResultDto
{
    public string AccessToken {get;set;} =string.Empty;
    public int ExpiryMinutes {get;set;}
}